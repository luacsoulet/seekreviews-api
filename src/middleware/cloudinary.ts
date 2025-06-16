import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';

config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (buffer: Buffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'seekreviews' }, (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url);
        }).end(buffer);
    });
};