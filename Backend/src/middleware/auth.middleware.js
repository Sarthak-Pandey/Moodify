const jwt = require("jsonwebtoken");
const redis = require("../config/cache");

async function authUser(req, res, next) {


    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Token not provided"
        });
    }

    try {
        const isTokenBlacklisted = await redis.get(token);


        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (err) {

        console.log(err);

        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

module.exports = { authUser };

