const mongoose = require("mongoose");
    
    const UserSchema = new mongoose.Schema
    (
        {
            name: {type: String, require: true},
             email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
            "Only Gmail addresses are allowed"
        ]
    },
            password: {type: String, require: true},
            profileImageUrl: {type: String, default: null},
        },{timestamps: true}
    );
    
    module.exports = mongoose.model("User",UserSchema);