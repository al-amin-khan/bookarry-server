import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { booksRouter } from "./books.js";
import { orderRouter } from './order.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Bookarry API is running",
    });
});

app.use('/api/v1/books/', booksRouter);
app.use('/api/v1/orders/', orderRouter);


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use((err, req, res) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});


async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}

startServer();
