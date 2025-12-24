
import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "./db.js";
import { middleware } from "./middleware.js";

const router = express.Router();

router.get("/", middleware.logger, middleware.verifyToken, async (req, res) => {
    const email = req.query.email || req.decoded_email;

    if (email !== req.decoded_email) {
        return res.status(403).json({
            success: false,
            message: "Forbidden access!",
        });
    }

    try {
        const db = getDB();
        const wishlist = await db
            .collection("wishlists")
            .aggregate([
                { $match: { email } },
                {
                    $lookup: {
                        from: "books",
                        localField: "bookId",
                        foreignField: "_id",
                        as: "book",
                    },
                },
                { $unwind: "$book" },
                { $sort: { created_at: -1 } },
            ])
            .toArray();

        res.json({
            success: true,
            message: "Wishlist fetched successfully",
            data: wishlist,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist",
        });
    }
});

router.post("/:bookId/add", middleware.logger, middleware.verifyToken, async (req, res) => {
    const { bookId } = req.params;
    console.log(bookId)
    const db = getDB();
    const book = await db.collection("books").findOne({ _id: new ObjectId(bookId) });
    console.log(book)
    const email = req.decoded_email;

    if (!ObjectId.isValid(bookId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid book ID format",
        });
    }

    try {
        const db = getDB();
        const bookObjectId = new ObjectId(bookId);
        const book = await db.collection("books").findOne({ _id: bookObjectId });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        const existing = await db.collection("wishlists").findOne({
            email,
            bookId: bookObjectId,
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Book already in wishlist",
            });
        }

        const wishlistItem = {
            email,
            bookId: bookObjectId,
            created_at: new Date(),
        };

        const result = await db.collection("wishlists").insertOne(wishlistItem);

        res.json({
            success: true,
            message: "Book added to wishlist",
            data: result,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to add book to wishlist",
        });
    }
});

export const wishlistRouter = router;
