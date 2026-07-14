const transporter = require("../config/mail.config");

const sendVerificationEmail = async (email, verificationLink) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        html: `
            <h2>Welcome!</h2>
            <p>Please verify your email by clicking the button below.</p>

            <a href="${verificationLink}"
               style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    border-radius:6px;
               ">
                Verify Email
            </a>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>

            <p>${verificationLink}</p>
        `
    });
};

module.exports = {
    sendVerificationEmail
};

