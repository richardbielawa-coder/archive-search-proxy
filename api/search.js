// api/search.js
const SUPABASE_URL = "https://sotlivluneouoaptserx.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Per-table configs (adjust columns to your real schema)
const TABLES = {
  archive_records: {
    select: "id,title,description:content,external_url:url,created_at",
    searchCol: "title",
  },
  legal_archive: {
    select: "id,title,description,external_url,created_at",
    searchCol: "title",
  },
};

export default async function handler(req, res) {
  try {
    const { q } = req.query;
    let { limit = "10", offset = "0", table = "archive_records" } = req.query;

    if (!q) return res.status(400).json({ error: "Missing required query parameter: q" });
    if (!TABLES[table]) {
      return res.status(400).json({ error: "Invalid table name", allowed: Object.keys(TABLES) });
    }
    if (!SUPABASE_KEY) {
      return res.status(500).json({ error: "Missing SUPABASE_KEY environment variable" });
    }

    // Coerce & guard
    limit = String(Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50));
    offset = String(Math.max(parseInt(offset, 10) || 0, 0));

    const cfg = TABLES[table];
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    url.searchParams.set("select", cfg.select);
    url.searchParams.set(cfg.searchCol, `ilike.*${q}*`);
    url.searchParams.set("limit", limit);
    url.searchParams.set("offset", offset);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "count=exact",
      },
    });

    const text = await response.text(); // keep raw for clearer error messages
    res.setHeader("Content-Type", "application/json");
    return res.status(response.status).send(text);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Proxy error", detail: String(e) });
  }
}
