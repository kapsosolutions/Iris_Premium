import express from 'express';
import multer from 'multer';
import FlowAsset from '../models/FlowAsset.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/** GET /api/flow-assets — Fetch all flow images & text assets */
router.get('/', async (req, res) => {
  try {
    const assets = await FlowAsset.find();
    res.json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** POST /api/flow-assets/upload — Admin route to upload/update flow image & text */
router.post('/upload', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { assetKey, title, textContent } = req.body;
    if (!assetKey) return res.status(400).json({ success: false, message: 'assetKey is required' });

    let existingAsset = await FlowAsset.findOne({ assetKey });
    let imageUrl = req.body.imageUrl || existingAsset?.imageUrl;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'iris_flow_images');
      imageUrl = uploadResult.secure_url;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image file or imageUrl required' });
    }

    const updateFields = {
      assetKey,
      title: title || assetKey,
      imageUrl
    };

    if (textContent !== undefined) {
      updateFields.textContent = textContent;
    }

    const updatedAsset = await FlowAsset.findOneAndUpdate(
      { assetKey },
      updateFields,
      { new: true, upsert: true }
    );

    res.json({ success: true, data: updatedAsset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** PUT /api/flow-assets/text — Update text content for a specific flow asset (e.g. welcome message body) */
router.put('/text', authenticateAdmin, async (req, res) => {
  try {
    const { assetKey, textContent } = req.body;
    if (!assetKey) return res.status(400).json({ success: false, message: 'assetKey is required' });

    const updatedAsset = await FlowAsset.findOneAndUpdate(
      { assetKey },
      { textContent },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: updatedAsset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
