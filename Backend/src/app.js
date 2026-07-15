const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require('cors');

const path = require("path");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use('/songs', express.static(path.join(__dirname, 'public/songs')));
app.use('/posters', express.static(path.join(__dirname, 'public/posters')));

const songRoutes = require('./routes/song.routes');
const authRoutes = require('./routes/auth.routes');
const spotifyRoutes = require("./routes/spotify.routes");


app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/spotify', spotifyRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: "API Route not found" });
});

app.use((err, req, res, next) => {
    console.error("Global Error Handler caught:", err.stack || err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;

