import express from "express";
import { getDB } from "./db.js";
import { ObjectId } from "mongodb";
import { middleware } from "./middleware.js";

const router = express.Router();

router.get("/latest",  middleware.logger,  async (req, res) => {
    try {
        const db = getDB();
        const books = await db
            .collection("books")
            .find()
            .sort({ created_at: -1 })
            .limit(8)
            .toArray();

        res.json({
            success: true,
            message: "Latest books fetched successfully",
            data: books,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch latest books",
        });
    }
});

router.get("/", middleware.logger,  async (req, res) => {
    try {
        const db = getDB();
        const books = await db
            .collection("books")
            .find()
            .sort({ created_at: -1 })
            .toArray();

        res.json({
            success: true,
            message: "All books fetched successfully",
            data: books,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch all books",
        });
    }
});

router.get("/:id", middleware.logger, async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid book ID format",
        });
    }

    try {
        const db = getDB();
        const query = { _id: new ObjectId(id) };
        const book = await db.collection("books").findOne(query);

        if (book === null) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        res.json({
            success: true,
            message: "Book fetched successfully",
            data: book,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch book",
        });
    }
});


router.post("/", middleware.logger, middleware.verifyToken, middleware.verifyAdminOrLibrarian, async (req, res) => {
    const bookData = req.body;
    const db = getDB();
    const result = await db.collection("books").insertOne(bookData);
    res.json({
        message: "Book added successfully",
        data: result,
    });
});

router.patch("/:id/status", middleware.verifyToken, middleware.verifyAdminOrLibrarian, async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const allowedStatuses = ["published", "unpublished"];

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid book ID format",
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status",
        });
    }

    try {
        const db = getDB();
        const query = { _id: new ObjectId(id) };
        const update = { $set: { status } };
        const result = await db.collection("books").updateOne(query, update);

        res.json({
            success: true,
            message: "Book status updated successfully",
            data: result,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update book status",
        });
    }
});


export const booksRouter = router;
