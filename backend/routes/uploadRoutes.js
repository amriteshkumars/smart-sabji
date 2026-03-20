const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');
const { successResponse } = require('../utils/helpers');

// ─── Multer config (local storage as fallback) ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid =
    allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// ─── @POST /api/upload/image (Admin only) ─────────────────────────────────────
router.post(
  '/image',
  protect,
  admin,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    // Try Cloudinary if configured
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'smart-sabji/products',
          transformation: [{ width: 600, height: 600, crop: 'fill', quality: 'auto' }],
        });

        return successResponse(res, 200, 'Image uploaded to Cloudinary', {
          url: result.secure_url,
          publicId: result.public_id,
        });
      } catch (cloudErr) {
        console.error('Cloudinary upload failed, falling back to local:', cloudErr.message);
      }
    }

    // Local fallback
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return successResponse(res, 200, 'Image uploaded locally', {
      url: imageUrl,
      publicId: req.file.filename,
    });
  })
);

module.exports = router;
