const axios = require("axios");
const spotifyConfig = require("../config/spotify.config");
let accessToken = null;
let tokenExpiresAt = 0;

const getAccessToken = async () => {
    if (accessToken && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    try {
        const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            "grant_type=client_credentials",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                auth: {
                    username: spotifyConfig.clientId,
                    password: spotifyConfig.clientSecret,
                },
            }
        );

        accessToken = response.data.access_token;

        tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;

        return accessToken;

    } catch (error) {
        console.error(
            "Spotify Token Error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to get Spotify access token");
    }
};

module.exports = {
    getAccessToken
};

