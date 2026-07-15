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


const searchSongs = async (req,res)=>{
    try{
        const {q} = req.query;
        if(!q){
            return res.status(400).json({
                success:false,
                message:"Search query is required"
            })
        }
        const songs  = await spotifyService.searchSongs(q);

        res.status(200).json({
            success:true,
            songs
        });
    } catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};


module.exports = { getAccessToken, searchSongs };