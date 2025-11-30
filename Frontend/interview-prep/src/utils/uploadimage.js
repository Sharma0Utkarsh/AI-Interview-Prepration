import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosinstance";

const uploadImage = async (imageFile) =>{
    const fromData = new FormData();
    //Append image file to form data
    fromData.append('image',imageFile);

    try {
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE,fromData,{
            headers:{
            'Content-Type': 'multipart/form-data', //Set header for file upload
        },
        });
        return response.data; //Return response data
    } catch (error) {
        console.error('Error uploading the image:', error);
        throw error;// Rethrow error for handling
        
    }
};

export default uploadImage;