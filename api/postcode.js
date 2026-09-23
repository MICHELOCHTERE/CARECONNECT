export default async function handler(req, res) {
  const { postcode } = req.query;
  if (!postcode) return res.status(400).json({ error: "Postcode required" });

  try {
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status !== 200) {
      return res.status(404).json({ error: "Postcode not found" });
    }

    const r = data.result;
    res.status(200).json({
      postcode: r.postcode,
      town: r.parish || r.admin_ward || "",
      city: r.admin_district || "",
      county: r.admin_county || r.region || "",
      district: r.admin_district || "",
    });
  } catch (e) {
    res.status(500).json({ error: "Lookup failed", detail: e.message });
  }
}
