const express = require("express");
    const { registerUser, loginUser, getUserProfile} = require("../controllers/authController");
    const { protect } = require("../middleware/authMiddleware");
    
    const router = express.Router (); //get user profile
    
    //Auth Routes
    router.post("/register", registerUser);//Register User
    router.post("/login", loginUser);//Login USer
    router.get("/profile",protect, getUserProfile);// Get User Profile
    const upload = require("../middleware/uploadMiddleware");
    
    router.post("/upload-image", protect, upload.single("image"),(req,res)=>{ // Added 'protect' middleware
        if(!req.file){
            return res.status(400).json({message:"No file uploaded"});
        }
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
            req.file.filename
        }`;
        res.status(200).json({imageUrl});
        
    });
    
    module.exports = router;