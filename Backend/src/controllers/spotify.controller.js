const spotifyService = require("../services/spotify.service");

const getAccessToken = async (req,res) =>{
    try{
        const token = await spotifyService.getAccessToken();

        res.status(200).json({
            success:true,
            accessToken:token,
        });
    } catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
};


module.exports = { getAccessToken }

