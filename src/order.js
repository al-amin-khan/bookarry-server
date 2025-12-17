
import express from "express";
import { getDB } from "./db.js";
import { middleware } from "./middleware.js";


const router = express.Router();

router.get("/", middleware.logger, middleware.verifyToken, async (req, res) => {
    const db = getDB();
    const orders = await db.collection("orders").find().toArray();
    res.json({
        success: true,
        message: "Orders fetched successfully",
        data: orders,
    });
})


router.post("/", middleware.logger, middleware.verifyToken, async (req, res) => {
    const data = req.body;
    const db = getDB();
    console.log(data)
    const order = await db.collection("orders").insertOne(data);
    res.json({
        success: true,
        message: "Order created successfully",
        data: order,
    });
});

export const orderRouter = router;
