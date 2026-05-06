import Stripe from "stripe";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// Disable body parsing so we can verify the raw Stripe signature
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Map Stripe Price IDs back to plan names
// REPLACE these with your actual price IDs
const PRICE_TO_PLAN = {
  price_1TLfUURjwUXgt5tuUtQzq4Rq: "starter",
  price_1TLfXXRjwUXgt5tuQcHs8U6T: "growth",
  price_1TLfYBRjwUXgt5tuspMtz3Yf: "enterprise",
};

// Plan limits
const PLAN_LIMITS = {
  starter: { maxApplications: 50, analytics: false, multiAdmin: false, whiteLabel: false },
  growth: { maxApplications: -1, analytics: true, multiAdmin: true, whiteLabel: false },
  enterprise: { maxApplications: -1, analytics: true, multiAdmin: true, whiteLabel: true },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {

      // Payment successful — activate the plan
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const plan = session.metadata?.plan;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!customerEmail || !plan) break;

        // Find agency by email and update their plan
        const agenciesRef = db.collection("agencies");
        const snapshot = await agenciesRef.where("email", "==", customerEmail).get();

        if (!snapshot.empty) {
          const agencyDoc = snapshot.docs[0];
          await agencyDoc.ref.update({
            plan,
            status: "active",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            planActivatedAt: new Date(),
            ...PLAN_LIMITS[plan],
          });
          console.log(`✅ Plan activated: ${plan} for ${customerEmail}`);
        } else {
          // Agency hasn't registered yet — store pending activation
          await db.collection("pendingActivations").doc(customerEmail).set({
            plan,
            status: "paid",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            paidAt: new Date(),
            ...PLAN_LIMITS[plan],
          });
          console.log(`📋 Pending activation stored for ${customerEmail}`);
        }
        break;
      }

      // Subscription cancelled
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const snapshot = await db.collection("agencies")
          .where("stripeSubscriptionId", "==", subscription.id)
          .get();

        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            status: "cancelled",
            plan: "none",
            cancelledAt: new Date(),
          });
          console.log(`❌ Subscription cancelled: ${subscription.id}`);
        }
        break;
      }

      // Payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const snapshot = await db.collection("agencies")
          .where("stripeCustomerId", "==", invoice.customer)
          .get();

        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            status: "payment_failed",
          });
          console.log(`⚠️ Payment failed for customer: ${invoice.customer}`);
        }
        break;
      }

      // Subscription renewed / updated
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = PRICE_TO_PLAN[priceId];

        if (plan) {
          const snapshot = await db.collection("agencies")
            .where("stripeSubscriptionId", "==", subscription.id)
            .get();

          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
              plan,
              status: subscription.status === "active" ? "active" : subscription.status,
              ...PLAN_LIMITS[plan],
            });
            console.log(`🔄 Subscription updated: ${plan} for ${subscription.id}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }

  return res.status(200).json({ received: true });
}
