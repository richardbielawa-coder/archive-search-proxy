import { NextResponse } from 'next/server';

const TABLES = {
  archive_records: 'id,title,external_url:url,description:content,created_at',
  legal_archive: 'id,title,external_url:url,description:content,created_at'
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const table = searchParams.get('table') || 'archive_records';
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 10, 1), 100);
  const offset = Math.max(parseInt(searchParams.get('offset')) || 0, 0);

  if (!q) return NextResponse.json({ error: 'Missing query parameter: q' }, { status: 400 });
  
  const cfg = TABLES[table];
  if (!cfg) return NextResponse.json({ error: 'Invalid table', allowed: Object.keys(TABLES) }, { status: 400 });

  const KEY = process.env.SUPABASE_KEY;
  if (!KEY) return NextResponse.json({ error: 'SUPABASE_KEY not configured' }, { status: 500 });

  try {
    const url = new URL(`https://sotlivluneouoaptserx.supabase.co/rest/v1/${table}`);
    url.searchParams.set('select', cfg);
    url.searchParams.set('title', `ilike.*${q}*`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));

    const r = await fetch(url, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'count=exact' }
    });

    return new Response(await r.text(), { status: r.status });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error', message: e.message }, { status: 500 });
  }
}
