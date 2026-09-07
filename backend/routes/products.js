import express from 'express';
import multer from 'multer';
import Product from '../models/Product.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { syncProductToMetaCatalog, deleteProductFromMetaCatalog, syncAllProductsToMetaCatalog } from '../services/catalogService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/** GET /api/products — Public route to fetch active products */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** GET /api/products/all — Admin route to fetch all products (including inactive) */
router.get('/all', authenticateAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** POST /api/products/sync-meta — Force sync all products & additional images to Meta Catalog */
router.post('/sync-meta', authenticateAdmin, async (req, res) => {
  try {
    syncAllProductsToMetaCatalog().catch(err => console.error('Bulk Sync Error:', err.message));
    res.json({ success: true, message: 'Syncing all products & additional images to Meta Commerce Catalog...' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** POST /api/products/upload — Admin route to upload product image to Cloudinary */
router.post('/upload', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file selected' });
    const result = await uploadToCloudinary(req.file.buffer, 'iris_premium_bottles');
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Image Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/** POST /api/products — Admin route to create product and auto-sync to Meta Catalog */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    if (!newProduct.retailerId) {
      newProduct.retailerId = `iris_prod_${newProduct._id}`;
    }
    await newProduct.save();

    // Trigger automatic Meta Commerce Catalog sync asynchronously
    syncProductToMetaCatalog(newProduct).catch(err => console.error('Catalog Sync Error:', err.message));

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/** PUT /api/products/:id — Admin route to update product and auto-sync to Meta Catalog */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ success: false, message: 'Product not found' });

    // Trigger automatic Meta Commerce Catalog sync asynchronously
    syncProductToMetaCatalog(updatedProduct).catch(err => console.error('Catalog Sync Error:', err.message));

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/** DELETE /api/products/:id — Admin route to delete product and remove from Meta Catalog */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ success: false, message: 'Product not found' });

    // Trigger automatic Meta Commerce Catalog item removal
    deleteProductFromMetaCatalog(req.params.id, deletedProduct.retailerId).catch(err => console.error('Catalog Delete Error:', err.message));

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
