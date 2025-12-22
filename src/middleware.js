import admin from "firebase-admin";
import serviceAccount from "../bookarry-service-key.json" with { type: "json" };
import { getDB } from "./db.js";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const logger = (req, res, next) => {
    console.log(req.ip, req.method, req.url);
    next();
};

const verifyToken = async (req, res, next) => {
    const token = req.headers?.authorization;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access!" });
    }
    try {
        if (typeof token !== "undefined") {
            const bearer = token.split(" ");
            const bearerToken = bearer[1];
            
            const decoded = await admin.auth().verifyIdToken(bearerToken);

            req.decoded_email = decoded.email;

            next();
        } else {
            return res.status(403).json({ message: "Forbidden access!" });
        }
    } catch (error) {
        return res.status(401).json({ message: "Forbidden access!" });
    }
};

const verifyAdmin = async (req, res, next) => {
    const email = req.decoded_email;
    
    if (!email) {
        return res.status(401).json({ message: "Unauthorized access!" });
    }

    const query = { email: email };
    try {
        const user = await getDB().collection("users").findOne(query);
        if (user?.role !== "admin") {
            return res.status(403).json({ message: "Forbidden access!" });
        }
        next();
    } catch (error) {
        return res.status(503).json({ message: "Service unavailable!" });
    }
};

const verifyLibrarian = async (req, res, next) => {
    const email = req.decoded_email;

    if (!email) {
        return res.status(401).json({ message: "Unauthorized access!" });
    }

    const query = { email: email };
    try {
        const user = await getDB().collection("users").findOne(query);
        if (user?.role !== "librarian") {
            return res.status(403).json({ message: "Forbidden access!" });
        }
        next();
    } catch (error) {
        return res.status(503).json({ message: "Service unavailable!" });
    }
};

const verifyAdminOrLibrarian = async (req, res, next) => {
    const email = req.decoded_email;

    if (!email) {
        return res.status(401).json({ message: "Unauthorized access!" });
    }

    const query = { email: email };
    try {
        const user = await getDB().collection("users").findOne(query);
        if (user?.role !== "admin" && user?.role !== "librarian") {
            return res.status(403).json({ message: "Forbidden access!" });
        }
        next();
    } catch (error) {
        return res.status(503).json({ message: "Service unavailable!" });
    }
};

export const middleware = {
    logger,
    verifyToken,
    verifyAdmin,
    verifyLibrarian,
    verifyAdminOrLibrarian,
};
