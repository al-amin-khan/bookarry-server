import express from "express";
import { getDB } from "./db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/latest", async (req, res) => {
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

router.get("/", async (req, res) => {
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

router.get("/:id", async (req, res) => {
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


router.post("/", async (req, res) => {
    const bookData = req.body;
    const db = getDB();
    const result = await db.collection("books").insertOne(bookData);
    res.json({
        message: "Book added successfully",
        data: result,
    });
});


export const booksRouter = router;
