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

// Add a new cart item (each call adds one unique instance)
router.post("/items", requireAuth("customer"), async (req: any, res) => {
  const userId = req.user.id;
  const { productId, sizeIndex } = req.body;
  if (!Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: "Invalid product ID" });
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

  // Ensure cart exists
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    {},
    { upsert: true, new: true }
  );

  // Always push a new, individual item
  cart.items.push({
    product: new Types.ObjectId(productId),
    quantity: 1,
    sizeIndex,
  });

  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

// backend/src/routes/cart.ts

// Update the sizeIndex of a specific cart item
// Update sizeIndex of a specific cart item
router.patch("/items/:itemId/size", requireAuth("customer"), async (req: any, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const { newSizeIndex } = req.body;

  if (!Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  const item = cart.items.find(i => i._id?.toString() === itemId);
  if (!item) return res.status(404).json({ error: "Item not found in cart" });

  const product = await Product.findById(item.product);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (
    !Array.isArray(product.sizes) ||
    newSizeIndex < 0 ||
    newSizeIndex >= product.sizes.length
  ) {
    return res.status(400).json({ error: "Invalid size index" });
  }

  item.sizeIndex = newSizeIndex;

  await cart.save();
  await cart.populate("items.product");

  res.json(cart);
});




// Remove a specific cart item by its unique item ID

router.delete(
  "/items/:itemId",
  requireAuth("customer"),
  async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.params;
    if (!Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    // Now i._id is declared, so this filters correctly:
    cart.items = cart.items.filter(i => i._id && i._id.toString() !== itemId);

    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  }
);


export default router;
