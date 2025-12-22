
import express from "express";
import { getDB } from "./db.js";
import { middleware } from "./middleware.js";
import { ObjectId } from 'mongodb';


const router = express.Router();

router.get("/", middleware.logger, middleware.verifyToken, async (req, res) => {
    const { email } = req.query;

    if(email === req.decoded_email){
        const db = getDB();
        const orders = await db.collection("orders").find({email}).toArray();
        res.json({
            success: true,
            message: "Orders fetched successfully",
            data: orders,
        });
    } else {
        res.status(403).json({
            success: false,
            message: "Forbidden access!",
        });
    }
});

router.get("/all", middleware.logger, middleware.verifyToken, async (req, res) => {
    const db = getDB();
    const orders = await db.collection("orders").find().toArray();
    res.json({
        success: true,
        message: "Orders fetched successfully",
        data: orders,
    });
})

router.put(`/:orderId/cancel`, middleware.logger, middleware.verifyToken, async (req, res) => {
    const orderId = req.params.orderId;
    
    const db = getDB();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found",
        });
    }
    if (order.order_status === "canceled") {
        return res.status(400).json({
            success: false,
            message: "Order is already canceled",
        });
    }
    await db.collection("orders").updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { order_status: "canceled",  update_at: new Date()} }
    );
    res.json({
        success: true,
        message: "Order canceled successfully",
    });
});
    


router.post("/", middleware.logger, middleware.verifyToken, async (req, res) => {
    const data = req.body;
    const db = getDB();
    const order = await db.collection("orders").insertOne(data);
    res.json({
        success: true,
        message: "Order created successfully",
        data: order,
    });
});

export const orderRouter = router;
