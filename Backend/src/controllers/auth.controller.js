const crypto = require("crypto");
const userModel = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const redis = require("../config/cache");
const { sendVerificationEmail } = require("../services/email.service");

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, 
    sameSite: "lax",
    maxAge: 3 * 24 * 60 * 60 * 1000
};

async function registerUser(req, res, next) {
    try {
        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        

        username = username.trim();
        email = email.trim().toLowerCase();

        const isAlreadyRegistered = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (isAlreadyRegistered) {
            return res.status(409).json({
                message: "User with the same email or username already exists"
            });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const verificationTokenExpires = new Date(
            Date.now() + 60 * 60 * 1000
        );

        const user = await userModel.create({
            username,
            email,
            password,
            verificationToken,
            verificationTokenExpires
        });

        try {
            const verificationLink =
                `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

            await sendVerificationEmail(user.email, verificationLink);
        } catch (emailError) {
            console.error(emailError);

            await userModel.findByIdAndDelete(user._id);

            return res.status(500).json({
                message:
                    "Failed to send verification email. Please try again."
            });
        }

        const token = generateToken(user);
        res.cookie("token",token,COOKIE_OPTIONS);

        return res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
}


async function loginUser(req, res, next) {
    try {
        const { email, username, password } = req.body;

        if ((!email && !username) || !password) {
            return res.status(400).json({
                message: "Email/Username and password are required"
            });
        }

        const query = email
            ? { email: email.toLowerCase() }
            : { username };

        const user = await userModel
            .findOne(query)
            .select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid Credentials"
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Credentials"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in."
            });
        }

        const token = generateToken(user);

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        next(error);
    }
}


async function getMe(req, res, next) {
    try {
        const user = await userModel
            .findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user
        });

    } catch (error) {
        next(error);
    }
}


async function logoutUser(req, res, next) {
    try {
        const token = req.cookies.token;

        if (token) {
            await redis.set(
                token,
                "blacklisted",
                "EX",
                3 * 24 * 60 * 60
            );
        }

        res.clearCookie("token", COOKIE_OPTIONS);

        return res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        next(error);
    }
}


async function verifyEmail(req, res, next) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                message: "Verification token is required"
            });
        }

        const user = await userModel.findOne({
            verificationToken: token,
            verificationTokenExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification token"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        return res.redirect(
            `${process.env.FRONTEND_URL}/login?verified=true`
        );

    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
    logoutUser,
    verifyEmail
};

