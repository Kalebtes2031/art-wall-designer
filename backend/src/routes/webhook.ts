import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order';
import Payment from '../models/Payment';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' });

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }), // important!
  async (req: any, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata.orderId;
        const order = await Order.findById(orderId);
        if (order && order.status !== 'paid') {
          order.status = 'paid';
          await order.save();

          await Payment.create({
            order: order._id,
            amount: intent.amount / 100,
            status: 'success',
            stripePaymentIntentId: intent.id,
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        const failedOrder = await Order.findById(failedIntent.metadata.orderId);
        if (failedOrder) {
          await Payment.create({
            order: failedOrder._id,
            amount: failedIntent.amount / 100,
            status: 'failed',
            stripePaymentIntentId: failedIntent.id,
          });
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

export default router;
