import express from "express";
import Stripe from "stripe";
import { ObjectId } from 'mongodb';
import { getDB } from "./db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
    console.log('hit')
    const paymentInfo = req.body;
    
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: paymentInfo.title,
                        description: paymentInfo.order,
                        images: [paymentInfo.image],
                    },
                    unit_amount: Number(paymentInfo.price) * 100,
                },
                quantity: 1,
            },
        ],
        customer_email: paymentInfo.email,
        metadata: {
            orderId: paymentInfo.order,
            name: paymentInfo.customer_name,
            email: paymentInfo.customer_email,
        },
        mode: "payment",
        success_url: `${process.env.PAYMENT_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.PAYMENT_DOMAIN}/dashboard/payment-canceled`,
    });

    res.send({
        url: session.url,
    });
});

router.patch("/confirm-payments", async (req, res) => {
    const sessionId = req.query.session_id;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
        const orderId = session.metadata.orderId;

        const query = {order: orderId };
        const updateDoc = {
            $set: {
                payment_status: 'paid',
                transaction_id: session.payment_status,
                update_at: new Date(),
            },
        };
        const db = getDB();
        const result = await db.collection('orders').updateOne(query, updateDoc);
        return res.json({
            success: true,
            message: "Payment confirmed and order updated",
            data: result,
        });
    }
    res.status(400).json({
        success: false,
        message: "Payment not completed",
    });
});

export const paymentRouter = router;
