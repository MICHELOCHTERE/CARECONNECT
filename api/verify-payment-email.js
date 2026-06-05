import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ valid: false, error: "Email required" });
  }

  try {
    // Check pendingActivations — stored by webhook when payment succeeds
    const pendingDoc = await db.collection("pendingActivations").doc(email.toLowerCase()).get();

    if (pendingDoc.exists) {
      const data = pendingDoc.data();
      if (data.status === "paid") {
        return res.status(200).json({
          valid: true,
          plan: data.plan || "starter",
          email: email.toLowerCase(),
        });
      }
    }

    // Also check if already registered agency (paid but already registered)
    const agenciesSnapshot = await db.collection("agencies")
      .where("email", "==", email.toLowerCase())
      .get();

    if (!agenciesSnapshot.empty) {
      return res.status(200).json({
        valid: false,
        alreadyRegistered: true,
        error: "Account already exists — please log in instead",
      });
    }

    return res.status(200).json({ valid: false, error: "No payment found for this email" });

  } catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({ valid: false, error: "Verification failed" });
  }
}
