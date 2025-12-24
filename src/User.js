import express from "express";
import { getDB } from "./db.js";
import { middleware } from "./middleware.js";
import { ObjectId } from "mongodb";

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

router.get("/", middleware.verifyToken, middleware.verifyAdmin, async (req, res) => {
    try {
        const users = await getDB().collection("users").find().toArray();
        res.json({
            message: "Users fetched successfully",
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
});

router.get("/role", middleware.verifyToken, async (req, res) => {
    const email = req.query.email || req.decoded_email;

    if (email !== req.decoded_email) {
        const user = await getDB().collection("users").findOne({ email: req.decoded_email });
        if (user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden access",
            });
        }
    }

    const result = await getDB().collection("users").findOne({ email });

    res.json({ message: "User role fetched successfully", data: result });
});

router.patch("/:id/role", middleware.verifyToken, middleware.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    
    const { role } = req.body;
    
    const allowedRoles = ["admin", "librarian", "user"];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid role",
        });
    }

    const result = await getDB()
        .collection("users")
        .updateOne({ _id: new ObjectId(id) }, { $set: { role } });

    res.json({
        message: "User role updated successfully",
        data: result,
    });
});

export const userRouter = router;
