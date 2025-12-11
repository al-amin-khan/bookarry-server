// src/db.js
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.b03mt96.mongodb.net/?appName=Cluster0;`;
const dbName = process.env.MONGO_DB_NAME || "bookarrydb";

if (!uri) {
    throw new Error("MONGO_URI is not defined in .env");
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let db;

export async function connectDB() {
    if (db) return db;

    await client.connect();
    db = client.db(dbName);
    console.log(`✅ Connected to MongoDB database: ${dbName}`);
    return db;
}

export function getDB() {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB() first.");
    }
    return db;
}
