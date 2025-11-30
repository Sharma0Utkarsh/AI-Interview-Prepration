const multer = require('multer');
    const path = require('path');
    
    //configure storage
    const storage = multer.diskStorage({
        destination: (req,file,cb)=>{
            cb(null,'uploads/'); // This folder must exist in your Backend directory
        },
        filename:(req,file,cb) =>{
            cb(null,`${Date.now()}-${file.originalname}`);
        },
    });
    
    //File Transfer
    const fileFilter = (req, file,cb)=>{
    const allowedTypes = ['image/jpeg','image/png','image/jpg'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new Error("Only .jpeg, .jpg, .png formats are allowed"), false)
    }
    };
    
    const upload  = multer({storage, fileFilter});
    
    module.exports = upload;