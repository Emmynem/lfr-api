import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import logger from "../common/logger.js";
import dotenv from 'dotenv';

dotenv.config();

const { cloudy_key, cloudy_name, cloudy_secret } = process.env;

// Return "https" URLs by setting secure: true
cloudinary.config({
    cloud_name: cloudy_name,
    api_key: cloudy_key,
    api_secret: cloudy_secret,
    secure: true
});

/////////////////////////
// Uploads a file
/////////////////////////
export const uploadFile = async (file, directory) => {

    const options = {
        public_id: uuidv4(),
        folder: `/lfr/${directory}`,
        quality: 'auto:eco', // Adjust quality setting as needed
        resource_type: "auto",
    };

    try {
        const b64 = Buffer.from(file.buffer).toString("base64");
        let dataURI = "data:" + file.mimetype + ";base64," + b64;
        // Upload the file
        const result = await cloudinary.uploader.upload(dataURI, options);
        return { ...result, success: true };
    } catch (error) {
        return { ...error, success: false };
    }
};

export const uploadMultipleFiles = async (files, directory) => {

    const options = {
        public_id: uuidv4(),
        folder: `/lfr/${directory}`,
        quality: 'auto:eco',
        resource_type: "auto",
    };

    try {
        const uploadPromises = files.map(async (file) => {
            const b64 = Buffer.from(file.buffer).toString("base64");
            let dataURI = "data:" + file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, options);
            return result;
        });

        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises);
        return { ...results, success: true };
    } catch (error) {
        return { ...error, success: false };
    }
};

/////////////////////////
// Delete a file
/////////////////////////
export const deleteFile = async (publicId) => {
    try {
        cloudinary.uploader.destroy(publicId)
            .then(result => {
                logger.info(`Deleted file with public id - ${publicId}`);
                return { ...result, success: true };
            }).catch(err => {
                logger.error(`Unable to delete file with public id - ${publicId}`);
                return { ...err, success: false };
            });   
    } catch (error) {
        return { ...error, success: false };
    }
};

/////////////////////////////////////
// Gets details of an uploaded file
/////////////////////////////////////
const getAssetInfo = async (publicId) => {

    // Return colors in the response
    const options = {
      colors: true,
    };

    try {
        // Get details about the asset
        const result = await cloudinary.api.resource(publicId, options);
        console.log(result);
        return result.colors;
        } catch (error) {
        console.error(error);
    }
};
