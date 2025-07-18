import express from 'express';
import Product from '../models/Product';
import { upload } from '../services/upload';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// List all products
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// Get single product
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('Not found');
  res.json(product);
});

// Create product (Admin)
router.post(
  '/',
  requireAdmin, 
  upload.single('image'),               // ← parse a single file field named "image"
  async (req, res) => {
    // Multer has populated:
    //   req.body  -> { title, description, widthCm, heightCm }
    //   req.file  -> the uploaded file
    const { sellerName, sellerPhone, price, widthCm, heightCm } = req.body;
    if (!sellerName || !req.file || !sellerPhone || !price) {
      return res.status(400).json({ error: 'seller info, price and image are required' });
    }

    // Build a public URL for the uploaded product image
    const imageUrl = `/uploads/${req.file.filename}`;

    try {
      const newProduct = await Product.create({
        sellerName,
        sellerPhone,
        price,
        imageUrl,
        transparentUrl: imageUrl,
        widthCm: widthCm ? Number(widthCm) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
      });
      res.status(201).json(newProduct);
    } catch (err) {
      console.error('Error creating product:', err);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Update product (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).send('Not found');
  res.json(updated);
});

// Delete product (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

export default router;