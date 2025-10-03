import mongoose from "mongoose";
import express from "express";
import Stripe from "stripe";
import Order from "../models/Order";
import Payment from "../models/Payment";
import BillingDetails from "../models/BillingDetails";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const intent = event.data.object as Stripe.PaymentIntent;
          const orderId = intent.metadata?.orderId;

          if (!orderId) {
            console.warn(
              "No orderId in metadata for PaymentIntent:",
              intent.id
            );
            break;
          }

          const order = await Order.findById(orderId);
          if (!order || order.status === "paid") {
            console.log(`Order ${orderId} already processed or not found.`);
            break;
          }

          // Retrieve the PaymentIntent with expanded charges
          const pi = (await stripe.paymentIntents.retrieve(intent.id, {
            expand: [
              "charges.data.balance_transaction",
              "charges.data.payment_method",
            ],
          })) as unknown as Stripe.PaymentIntent & {
            charges: Stripe.ApiList<Stripe.Charge>;
          };

          const charge = pi.charges.data[0];

          if (!charge) {
            console.warn("No charge found for PaymentIntent:", intent.id);
            break;
          }

          const billing = charge.billing_details;

          const billingDoc = await BillingDetails.create({
            user: order.user,
            fullName: billing?.name || "",
            email: billing?.email || "",
            phone: billing?.phone,
            address: {
              line1: billing?.address?.line1 || "",
              line2: billing?.address?.line2 || "",
              city: billing?.address?.city || "",
              state: billing?.address?.state || "",
              postalCode: billing?.address?.postal_code || "",
              country: billing?.address?.country || "",
            },
          });

          order.status = "paid";
          order.billingDetails = billingDoc._id as mongoose.Types.ObjectId;
          order.stripePaymentIntentId = intent.id;
          await order.save();

          const pm = charge.payment_method_details?.card;

          await Payment.create({
            order: order._id,
            amount: intent.amount / 100,
            status: "success",
            stripePaymentIntentId: intent.id,
            stripeCustomerId: intent.customer as string,
            paymentMethod: pm
              ? {
                  brand: pm.brand,
                  last4: pm.last4,
                  expMonth: pm.exp_month,
                  expYear: pm.exp_year,
                }
              : undefined,
          });

          console.log(`Order ${orderId} marked as paid successfully.`);
          break;
        }

        case "payment_intent.payment_failed": {
          const intent = event.data.object as Stripe.PaymentIntent;
          const orderId = intent.metadata?.orderId;
          if (!orderId) break;

          const order = await Order.findById(orderId);
          if (!order) break;

          await Payment.create({
            order: order._id,
            amount: intent.amount / 100,
            status: "failed",
            stripePaymentIntentId: intent.id,
          });

          console.warn(`Payment failed for order ${orderId}`);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error("Webhook handler error:", err);
      // Still respond 200 if you want Stripe to retry later
      res.status(500).send("Webhook handler error");
    }
  }
);

export default router;
