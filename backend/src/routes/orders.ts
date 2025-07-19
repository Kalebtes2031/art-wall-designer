// backend/src/routes/orders.ts
import express from 'express';
import Order from '../models/Order';
import Payment from '../models/Payment';
import Cart  from '../models/Cart';
import { requireAuth } from '../middleware/auth';
import { Types, Document } from 'mongoose';


interface CartItemPopulated {
  product: {
    _id: Types.ObjectId;
    price: number;
    seller: Types.ObjectId;
  };
  quantity: number;
}

interface CartPopulated {
  user: Types.ObjectId;
  items: CartItemPopulated[];
  updatedAt: Date;
}

const router = express.Router();


// 2) Use `.lean()` right after `.populate()`
router.post('/', requireAuth('customer'), async (req: any, res) => {
  const userId = req.user.id;
  const cart = await Cart
    .findOne({ user: userId })
    .populate('items.product')
    .lean<CartPopulated>();      // ← this returns a plain object matching CartPopulated

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const items = cart.items.map(i => ({
    product:      i.product._id,
    quantity:     i.quantity,
    priceAtOrder: i.product.price,
  }));
  const total = items.reduce((sum, x) => sum + x.quantity * x.priceAtOrder, 0);

  const order = await Order.create({ user: userId, items, total, status: 'pending' });
  
  // To clear, use update since `cart` is a plain object
  await Cart.updateOne({ user: userId }, { items: [] });

  res.status(201).json({ orderId: order._id, total });
});



// Fake payment
router.post('/:id/pay', requireAuth('customer'), async (req: any, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.user.toString() !== req.user.id) {
    return res.status(404).json({ error: 'Order not found' });
  }
  order.status = 'paid';
  await order.save();

  await Payment.create({ order: order._id, amount: order.total, status: 'success' });
  res.json({ status: 'success' });
});

// List orders
router.get('/', requireAuth(), async (req: any, res) => {
  const { role, id: userId } = req.user;
  let orders;

  if (role === 'admin') {
    orders = await Order.find().populate('items.product');
  } else if (role === 'seller') {
    // we need to filter orders whose items.product.seller === userId
    // first populate seller on product
    orders = await Order.find()
      .populate<{ items: ({ product: { seller: Types.ObjectId } })[] }>('items.product')
      .then(list =>
        list.filter(o =>
          o.items.some(i =>
            (i.product as any).seller.toString() === userId
          )
        )
      );
  } else {
    orders = await Order.find({ user: userId }).populate('items.product');
  }

  res.json(orders);
});

// Update status
router.put('/:id', requireAuth('admin','seller'), async (req: any, res) => {
  const order = await Order.findById(req.params.id)
    .populate<{ items: ({ product: { seller: Types.ObjectId } })[] }>('items.product');
  if (!order) return res.status(404).json({ error: 'Not found' });

  if (req.user.role === 'seller') {
    const owns = order.items.some(i =>
      (i.product as any).seller.toString() === req.user.id
    );
    if (!owns) return res.status(403).json({ error: 'Forbidden' });
  }

  order.status = req.body.status || order.status;
  await order.save();
  res.json(order);
});

export default router;
