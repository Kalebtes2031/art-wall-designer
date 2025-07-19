import express from 'express';
import Cart from '../models/Cart';
import { requireAuth } from '../middleware/auth';  // ensures token, role=customer

const router = express.Router();

// Get current user's cart
router.get('/', requireAuth('customer'), async (req: any, res) => {
  const userId = req.user.id;
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  res.json(cart);
});

// Add or update an item
router.post('/items', requireAuth('customer'), async (req: any, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const idx = cart.items.findIndex(i => i.product.toString() === productId);
  if (idx > -1) {
    // update quantity
    cart.items[idx].quantity = quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  cart.updatedAt = new Date();
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

// Remove an item
router.delete('/items/:productId', requireAuth('customer'), async (req: any, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $pull: { items: { product: productId } } },
    { new: true }
  ).populate('items.product');
  res.json(cart);
});

export default router;
