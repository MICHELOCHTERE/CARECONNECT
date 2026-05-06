import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Map plan names to your Stripe Price IDs
// REPLACE these with your actual price IDs from Stripe Dashboard
const PRICE_IDS = {
  starter: "price_1TLfUURjwUXgt5tuUtQzq4Rq",
  growth: "price_1TLfXXRjwUXgt5tuQcHs8U6T",
  enterprise: "price_1TLfYBRjwUXgt5tuspMtz3Yf",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { plan, email } = req.body;

  if (!plan || !PRICE_IDS[plan]) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email || undefined,
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      metadata: {
        plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://quikcare.co.uk"}/agency/register?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://quikcare.co.uk"}/#pricing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
