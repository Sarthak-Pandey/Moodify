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


const searchSongs = async (query)=>{
    
    const token  = await getAccessToken();

    try {
        const response = await axios.get(
            "https://api.spotify.com/v1/search",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    q: query,
                    type: "track",
                    limit: 10,
                },
            }
        );

        return response.data.tracks.items;
    } catch (error) {
        const spotifyError = error.response?.data?.error?.message || error.response?.data || error.message;
        console.error("Spotify Search Error:", spotifyError);
        throw new Error(`Spotify search failed: ${spotifyError}`);
    }
}


module.exports = {
    getAccessToken,
    searchSongs
};