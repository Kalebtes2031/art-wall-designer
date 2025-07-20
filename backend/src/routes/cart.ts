// backend/src/routes/cart.ts
import express from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { requireAuth } from "../middleware/auth";
import { Types } from "mongoose";

const router = express.Router();

// Get current user's cart
router.get("/", requireAuth("customer"), async (req: any, res) => {
  const userId = req.user.id;
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  res.json(cart);
});

// Add or update item
router.post("/items", requireAuth("customer"), async (req: any, res) => {
  const userId = req.user.id;
  const { productId, quantity, sizeIndex } = req.body;
  if (!Types.ObjectId.isValid(productId) || quantity < 1) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (
    !Array.isArray(product.sizes) ||
    sizeIndex < 0 ||
    sizeIndex >= product.sizes.length
  ) {
    return res.status(400).json({ error: "Invalid sizeIndex for product" });
  }

  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    {},
    { upsert: true, new: true }
  );

  const idx = cart.items.findIndex(
    (i) => i.product.equals(productId) && i.sizeIndex === sizeIndex
  );
  if (idx >= 0) {
    cart.items[idx].quantity = quantity;
  } else {
    cart.items.push({ product: productId, quantity, sizeIndex });
  }
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

// PATCH instead of DELETE for quantity decrement
router.patch(
  "/items/:productId/decrement",
  requireAuth("customer"),
  async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const sizeIndex = Number(req.query.sizeIndex);

    if (!Types.ObjectId.isValid(productId) || isNaN(sizeIndex)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (i) => i.product.equals(productId) && i.sizeIndex === sizeIndex
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      // remove the item if quantity becomes 0
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  }
);


// Remove item
router.delete(
  "/items/:productId",
  requireAuth("customer"),
  async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const sizeIndex = Number(req.query.sizeIndex); // from query string

    if (!Types.ObjectId.isValid(productId) || isNaN(sizeIndex)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => !i.product.equals(productId) || i.sizeIndex !== sizeIndex
    );
    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  }
);

export default router;
