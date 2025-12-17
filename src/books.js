import express from "express";
import { getDB } from "./db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/latest", async (req, res) => {
    console.log(req.headers)
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



export const booksRouter = router;
