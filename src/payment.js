import express from "express";
import Stripe from "stripe";
import { getDB } from "./db.js";
import { middleware } from "./middleware.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.get("/", middleware.logger, middleware.verifyToken, async (req, res) => {
    const { email } = req.query;
    if (email !== req.decoded_email) {
        return res.status(403).json({
            success: false,
            message: "Forbidden access!",
        });
    }
    const payments = await getDB().collection("payments").find({ email }).toArray();
    res.json({
        success: true,
        message: "Payments fetched successfully",
        data: payments,
    });
});

router.post("/create-checkout-session", async (req, res) => {
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
        const paymentEmail = session.customer_email || session.metadata?.email;

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
        await db.collection("payments").updateOne(
            { session_id: session.id },
            {
                $set: {
                    order: orderId,
                    email: paymentEmail,
                    amount_total: session.amount_total,
                    currency: session.currency,
                    payment_status: session.payment_status,
                    payment_intent: session.payment_intent,
                    update_at: new Date(),
                },
                $setOnInsert: {
                    session_id: session.id,
                    created_at: new Date(),
                },
            },
            { upsert: true }
        );
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


router.get('/invoices', middleware.logger, middleware.verifyToken, async (req, res) => {
    const { email } = req.query;
    if (email !== req.decoded_email) {
        return res.status(403).json({
            success: false,
            message: "Forbidden access!",
        });
    }
    const invoices = await getDB().collection("payments").find({ email }).toArray();
    res.json({
        success: true,
        message: "Invoices fetched successfully",
        data: invoices,
    });
});

export const paymentRouter = router;
