export default async function handler(req, res) {
  const { q, limit = 10, offset = 0, table = 'archive_records' } = req.query;

  if (!q) {
    return res.status(400).send('Missing required query parameter: q');
  }

  // Validate table name for security
  const allowedTables = ['archive_records', 'legal_archive'];
  if (!allowedTables.includes(table)) {
    return res.status(400).send('Invalid table name. Allowed: archive_records, legal_archive');
  }

  const SUPABASE_URL = 'https://sotlivluneouoaptserx.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set('select', 'id,title,content,url,created_at');
  url.searchParams.set('title', `ilike.*${q}*`);
  url.searchParams.set('limit', limit);
  url.searchParams.set('offset', offset);

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'count=exact',
    },
  });

  const data = await response.text();
  res.status(response.status).send(data);
}
