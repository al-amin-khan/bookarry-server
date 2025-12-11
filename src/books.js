import express from 'express';
import { getDB } from './db.js';


const router = express.Router();

router.get("/latest", async (req, res) => {
    try {
        const db = getDB();
        const books = await db.collection("books").find({}).limit(6).toArray();

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


export const booksRouter = router;
