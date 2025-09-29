// backend/src/routes/orders.ts
import express from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import { requireAuth } from '../middleware/auth';
import { Types } from 'mongoose';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' });

const router = express.Router();

// Create order from cart
router.post('/', requireAuth('customer'), async (req: any, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // item.product is populated, but TS may see it as any
  const items = cart.items.map(i => {
    const p: any = i.product;
    return {
      product:      p._id,
      quantity:     i.quantity,
      priceAtOrder: p.price,
      sizeIndex:    i.sizeIndex,
    };
  });
  const total = items.reduce((sum, i) => sum + i.quantity * i.priceAtOrder, 0);

  const order = await Order.create({ user: userId, items, total, status: 'pending' });

  // clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// Pay for order
router.post('/:id/pay', requireAuth('customer'), async (req: any, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid order ID' });
  const order = await Order.findById(id);
  if (!order || !order.user.equals(req.user.id)) {
    return res.status(404).json({ error: 'Order not found' });
  }
  order.status = 'paid';
  await order.save();
  res.json({ status: 'success' });
});

// backend/src/routes/orders.ts
router.get('/', requireAuth(), async (req: any, res) => {
  const { role, id } = req.user;

  // helper to build a base query + populates
  const baseQuery = () =>
    Order.find().populate('user','name email').populate('items.product');

  let orders;
  if (role === 'admin') {
    // admin sees everything
    orders = await baseQuery().lean();
  } else if (role === 'seller') {
    // sellers see only orders containing their products
    const all = await baseQuery();
    orders = all.filter(o =>
      o.items.some(i => {
        const p: any = i.product;
        return p.seller.equals(id);
      })
    );
  } else {
    // customers see only their own
    orders = await Order.find({ user: id })
      .populate('user','name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .lean();
  }

  res.json(orders);
});


// Update order status
router.patch('/:id', requireAuth('admin','seller'), async (req: any, res) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('items.product');
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (req.user.role === 'seller') {
    const owns = order.items.some(i => {
      const p: any = i.product;
      return p.seller.equals(req.user.id);
    });
    if (!owns) return res.status(403).json({ error: 'Forbidden' });
  }
  const { status } = req.body;
  if (status && ['pending','paid','shipped','cancelled'].includes(status)) {
    order.status = status;
    await order.save();
  }
  res.json(order);
});

// Create PaymentIntent
router.post('/:id/create-payment-intent', requireAuth('customer'), async (req: any, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order || !order.user.equals(req.user.id)) {
    return res.status(404).json({ error: 'Order not found' });
  }

  try {
    let paymentIntent;
    
    // Retry scenario: if PaymentIntent already exists, retrieve it
    if (order.stripePaymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total * 100), // cents
        currency: 'usd',
        metadata: { orderId: (order._id as Types.ObjectId).toString() },
        automatic_payment_methods: { enabled: true },
      });

      // Save PaymentIntent ID in order
      order.stripePaymentIntentId = paymentIntent.id;
      await order.save();
    }

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
