const express = require("express");
const router = express.Router();

const spotifyController = require("../controllers/spotify.controller");

router.get("/token", spotifyController.getAccessToken);

router.get('/search',spotifyController.searchSongs);

module.exports = router;
