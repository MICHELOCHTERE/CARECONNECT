export default async function handler(req, res) {
  const { postcode } = req.query;
  if (!postcode) return res.status(400).json({ error: "Postcode required" });

  try {
    const key = process.env.GETADDRESS_KEY;
    const response = await fetch(
      `https://api.getaddress.io/find/${encodeURIComponent(postcode)}?api-key=${key}&expand=true`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Lookup failed" });
  }
}
