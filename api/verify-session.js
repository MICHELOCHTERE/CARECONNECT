import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ valid: false, error: "No session ID provided" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid" || session.status === "complete") {
      return res.status(200).json({
        valid: true,
        plan: session.metadata?.plan || "starter",
        email: session.customer_email || session.customer_details?.email || "",
      });
    } else {
      return res.status(200).json({ valid: false, error: "Payment not completed" });
    }
  } catch (err) {
    console.error("Session verification error:", err);
    return res.status(200).json({ valid: false, error: "Invalid session" });
  }
}
