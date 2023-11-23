const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: 'dznwlaen6', 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET 
  });

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      allowed_formats: ["jpg", "png"],
      folder: 'nexreel',
    },
  });

module.exports = multer({ storage: storage });