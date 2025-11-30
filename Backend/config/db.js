const mongoose = require("mongoose");
    
    const connectDB = async () =>{
        try {
            await mongoose.connect(process.env.MONGO_URI, {});
            console.log("Mongodb Connected");
        } catch (error) {
            console.error("Error connecting to mongodb",error);
            process.exit(1);
        }
    };
    
    module.exports = connectDB;