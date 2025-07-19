import express from 'express';
import Product from '../models/Product';
import { upload } from '../services/upload';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// List all products
router.get('/', async (req, res) => {
  try {
    const products = await Product
      .find()
      .sort({ createdAt: -1 })
      // Populate the `seller` ObjectId with the actual User document
      // Second argument is a projection string: here we ask for name & email (add phone if you have it)
      .populate('seller', 'name email')
      .lean();  // optional: returns plain JS objects instead of Mongoose documents

    res.json(products);
  } catch (err) {
    console.error('[PRODUCTS][LIST]', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get only this seller’s products
router.get(
  '/mine',
  requireAuth('seller'),
  async (req, res) => {
    // req.user!.id comes from your requireAuth middleware
    const sellerId = req.user!.id;
    try {
      const products = await Product.find({ seller: sellerId }).sort({ createdAt: -1 });
      res.json(products);
    } catch (err) {
      console.error('[PRODUCTS][MINE]', err);
      res.status(500).json({ error: 'Failed to fetch your products' });
    }
  }
);


// Get single product
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('Not found');
  res.json(product);
});

// Create product (Admin)
router.post(
  '/',
  requireAuth('seller'), 
  upload.single('image'),               // ← parse a single file field named "image"
  async (req, res) => {
    // Multer has populated:
    //   req.body  -> { title, description, widthCm, heightCm }
    //   req.file  -> the uploaded file
    const { title, description, price, widthCm, heightCm } = req.body;
    if (!title || !req.file  || !price) {
      return res.status(400).json({ error: 'seller info, price and image are required' });
    }

    // Build a public URL for the uploaded product image
    const imageUrl = `/uploads/${req.file.filename}`;

    try {
      const newProduct = await Product.create({
        seller: req.user!.id,
        title,
        description: description || '',
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
router.put('/:id', requireAuth(), async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).send('Not found');
  res.json(updated);
});

// update product (Seller) that are sent in req.body
// and image file that is sent in req.file
router.patch(
  '/:id',
  requireAuth('seller'),
  upload.single('image'),
  async (req, res) => {
    const sellerId = req.user!.id;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });

    // Ownership check
    if (product.seller.toString() !== sellerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 2. Apply only provided fields:
    const { title, description, price, widthCm, heightCm, orientation } = req.body;
    if (title != null)         product.title       = title;
    if (description != null)   product.description = description;
    if (price != null)         product.price       = Number(price);
    if (widthCm != null)       product.widthCm     = Number(widthCm);
    if (heightCm != null)      product.heightCm    = Number(heightCm);
    if (orientation != null)   product.orientation = orientation;

    // 3. Handle optional new image:
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      product.imageUrl       = imageUrl;
      product.transparentUrl = imageUrl;
    }

    try {
      await product.save();
      res.json(product);
    } catch (err) {
      console.error('[PRODUCTS][PATCH]', err);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// delete product (Seller) - only if they own it
router.delete(
  '/:id',
  requireAuth('seller'),
  async (req, res) => {
    const sellerId = req.user!.id;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Ownership check
    if (product.seller.toString() !== sellerId) {
      return res.status(403).json({ error: 'Forbidden: cannot delete another seller’s product' });
    }

    try {
      await product.deleteOne();    // or Product.findByIdAndDelete(req.params.id)
      res.status(204).send();
    } catch (err) {
      console.error('[PRODUCTS][DELETE]', err);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
);

// Delete product (Admin)
// router.delete('/:id', requireAuth(), async (req, res) => {
//   await Product.findByIdAndDelete(req.params.id);
//   res.status(204).send();
// });

export default router;