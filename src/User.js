import express from "express";
import { getDB } from "./db.js";
import { middleware } from "./middleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const userData = req.body;

    if (userData.email) {
        const existingUser = await getDB()
            .collection("users")
            .findOne({ email: userData.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
    }
    
    const result = await getDB().collection("users").insertOne(userData);

    res.json({
        message: "User registered successfully",
        data: result,
    });
});

router.get("/role", middleware.verifyToken, middleware.verifyAdmin, async (req, res) => {
    const email = req.query.email;

    if (email !== req.decoded_email) {
        return res.status(403).json({
            success: false,
            message: "Forbidden access",
        });
    }

    const result = await getDB().collection("users").findOne({ email });

    res.json({ message: "User role fetched successfully", data: result });
});

export const userRouter = router;
