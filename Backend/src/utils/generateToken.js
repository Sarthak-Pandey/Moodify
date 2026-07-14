const jwt = require("jsonwebtoken");

function generateToken(user) {

    return jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "3d"
        }
    );

}

module.exports = generateToken;

