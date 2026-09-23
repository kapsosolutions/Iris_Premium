import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Brand from '../models/Brand.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const brandsUploadDir = path.join(__dirname, '../uploads/brands');

// Ensure local brands directory exists
if (!fs.existsSync(brandsUploadDir)) {
  fs.mkdirSync(brandsUploadDir, { recursive: true });
}

/** GET /api/brands — Public route to fetch active client brands */
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** GET /api/brands/all — Admin route to fetch all brands (active & inactive) */
router.get('/all', authenticateAdmin, async (req, res) => {
  try {
    const brands = await Brand.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** POST /api/brands/upload — Admin route to upload brand logo */
router.post('/upload', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    let imageUrl = '';

    // 1. Try uploading to Cloudinary if credentials are present
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'iris_brands');
      if (uploadResult?.secure_url) {
        imageUrl = uploadResult.secure_url;
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload skipped or failed, saving locally:', cloudErr.message);
    }

    // 2. Fallback: Save locally in backend/uploads/brands
    if (!imageUrl) {
      const ext = path.extname(req.file.originalname) || '.png';
      const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      const uniqueFilename = `brand_${Date.now()}_${cleanName}`;
      const filePath = path.join(brandsUploadDir, uniqueFilename);
      fs.writeFileSync(filePath, req.file.buffer);
      imageUrl = `/uploads/brands/${uniqueFilename}`;
    }

    res.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Brand Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/** POST /api/brands — Admin route to create a brand */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, imageUrl, order, active } = req.body;
    if (!name || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Brand name and image URL are required' });
    }

    let brandOrder = order;
    if (brandOrder === undefined || brandOrder === null) {
      const count = await Brand.countDocuments();
      brandOrder = count + 1;
    }

    const newBrand = new Brand({
      name: name.trim(),
      imageUrl,
      order: Number(brandOrder) || 0,
      active: active !== undefined ? Boolean(active) : true
    });

    await newBrand.save();
    res.status(201).json({ success: true, data: newBrand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** PUT /api/brands/:id — Admin route to update a brand */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl, order, active } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(400).json({ success: false, message: 'Brand not found' });
    }

    if (name !== undefined) brand.name = name.trim();
    if (imageUrl !== undefined) brand.imageUrl = imageUrl;
    if (order !== undefined) brand.order = Number(order);
    if (active !== undefined) brand.active = Boolean(active);

    await brand.save();
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** DELETE /api/brands/:id — Admin route to delete a brand */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
