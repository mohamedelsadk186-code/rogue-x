const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { v2: cloudinary } = require('cloudinary');
const authMiddleware = require('../middleware/auth');
const { requireAnyPermission } = require('../middleware/permissions');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(buffer, folder = 'rogue-x/products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

router.post('/images', authMiddleware, requireAnyPermission(['products.create', 'products.update']), upload.array('images', 8), async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary environment variables are missing' });
    }
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

    const results = [];
    for (const file of req.files) {
      const optimized = await sharp(file.buffer)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const uploaded = await uploadToCloudinary(optimized);
      results.push({
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
        width: uploaded.width,
        height: uploaded.height,
      });
    }

    return res.json({ images: results });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

module.exports = router;
