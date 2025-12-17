import admin from "firebase-admin";
import serviceAccount from "../bookarry-service-key.json" with { type: "json" };

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
            console.log({decoded});

            req.decoded_email = decoded.email;

            next();
        } else {
            return res.status(403).json({ message: "Forbidden access!" });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Forbidden access!" });
    }
};

export const middleware = {
    logger,
    verifyToken,
};
