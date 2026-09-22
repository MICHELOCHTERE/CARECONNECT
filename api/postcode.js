export default async function handler(req, res) {
  const { postcode } = req.query;
  if (!postcode) return res.status(400).json({ error: "Postcode required" });

  const key = process.env.GETADDRESS_KEY;
  console.log("GETADDRESS_KEY present:", !!key);
  console.log("Postcode:", postcode);

  if (!key) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const url = `https://api.getaddress.io/find/${encodeURIComponent(postcode)}?api-key=${key}&expand=true`;
    console.log("Calling:", url);
    const response = await fetch(url);
    console.log("GetAddress status:", response.status);
    const text = await response.text();
    console.log("GetAddress raw response:", text.slice(0, 300));
    if (!response.ok) return res.status(response.status).json({ error: `GetAddress returned ${response.status}`, body: text });
    const data = JSON.parse(text);
    res.status(200).json(data);
  } catch (e) {
    console.error("Fetch error:", e.message);
    res.status(500).json({ error: "Lookup failed", detail: e.message });
  }
}
