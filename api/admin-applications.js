import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

// Admin UID — only this user can access this endpoint
const ADMIN_UID = "XS3lVNTn9Dhlk1qNeOigzD48bbG2";

export default async function handler(req, res) {
  // Only allow GET and POST (for status updates)
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify the admin token from the request header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    // Verify the Firebase ID token
    const { getAuth } = await import("firebase-admin/auth");
    const decoded = await getAuth().verifyIdToken(token);

    // Check if the user is the admin
    if (decoded.uid !== ADMIN_UID) {
      return res.status(403).json({ error: "Forbidden — admin access only" });
    }

    // GET — fetch all applications
    if (req.method === "GET") {
      const snapshot = await db.collection("applications")
        .orderBy("createdAt", "desc")
        .get();

      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to strings
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        appliedAt: doc.data().appliedAt || null,
      }));

      return res.status(200).json({ applications });
    }

    // POST — update application status
    if (req.method === "POST") {
      const { id, status } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: "Missing id or status" });
      }

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await db.collection("applications").doc(id).update({ status });
      return res.status(200).json({ success: true });
    }

  } catch (err) {
    console.error("Admin API error:", err);
    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Token expired — please log in again" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
