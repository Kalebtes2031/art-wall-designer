import express from 'express';
import Product from '../models/Product';

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
router.post('/', async (req, res) => {
  const { title, description, imageUrl, widthCm, heightCm } = req.body;
  const newProduct = await Product.create({ title, description, imageUrl, widthCm, heightCm });
  res.status(201).json(newProduct);
});

// Update product (Admin)
router.put('/:id', async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).send('Not found');
  res.json(updated);
});

// Delete product (Admin)
router.delete('/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

export default router;