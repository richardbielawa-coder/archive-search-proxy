import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const limit = searchParams.get('limit') || '10';
  const offset = searchParams.get('offset') || '0';
  const table = searchParams.get('table') || 'archive_records';

  // Validate required parameters
  if (!q) {
    return NextResponse.json(
      { error: 'Missing required query parameter: q' },
      { status: 400 }
    );
  }

  // Validate environment variable
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  if (!SUPABASE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_KEY not configured' },
      { status: 500 }
    );
  }

  // Per-table configuration
  const tableConfig = {
    archive_records: {
      columns: 'id,title,description:content,url,created_at'
    },
    legal_archive: {
      columns: 'id,title,description:content,url,created_at'
    }
  };

  // Validate table name
  if (!tableConfig[table]) {
    return NextResponse.json(
      { 
        error: 'Invalid table name', 
        allowed: Object.keys(tableConfig) 
      },
      { status: 400 }
    );
  }

  // Validate and coerce limit/offset
  const validLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const validOffset = Math.max(parseInt(offset) || 0, 0);

  const SUPABASE_URL = 'https://sotlivluneouoaptserx.supabase.co';

  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    url.searchParams.set('select', tableConfig[table].columns);
    url.searchParams.set('title', `ilike.*${q}*`);
    url.searchParams.set('limit', validLimit.toString());
    url.searchParams.set('offset', validOffset.toString());

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'count=exact',
      },
    });

    const data = await response.text();
    
    if (!response.ok) {
      return new Response(data, { status: response.status });
    }

    return new Response(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}
