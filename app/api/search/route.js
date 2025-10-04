import { NextResponse } from "next/server"

const SUPABASE_URL = "https://sotlivluneouoaptserx.supabase.co"
const SUPABASE_KEY = process.env.SUPABASE_KEY

const TABLES = {
  archive_records: {
    select: "id,title,description:content,external_url:url,created_at",
    searchCol: "title",
  },
  legal_archive: {
    select: "id,title,description:content,external_url:url,created_at",
    searchCol: "title",
  },
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")
    let limit = searchParams.get("limit") ?? "10"
    let offset = searchParams.get("offset") ?? "0"
    const table = searchParams.get("table") ?? "archive_records"

    if (!q) return NextResponse.json({ error: "Missing ?q" }, { status: 400 })
    if (!SUPABASE_KEY) {
      return NextResponse.json({ error: "Missing SUPABASE_KEY" }, { status: 500 })
    }
    if (!TABLES[table]) {
      return NextResponse.json({ error: "Invalid table", allowed: Object.keys(TABLES) }, { status: 400 })
    }

    // coerce & guard
    limit = String(Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100))
    offset = String(Math.max(Number.parseInt(offset, 10) || 0, 0))

    const cfg = TABLES[table]
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`)
    url.searchParams.set("select", cfg.select)
    url.searchParams.set(cfg.searchCol, `ilike.*${q}*`)
    url.searchParams.set("limit", limit)
    url.searchParams.set("offset", offset)

    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "count=exact",
      },
    })

    const text = await r.text()
    const headers = { "Content-Type": "application/json" }
    return new NextResponse(text, { status: r.status, headers })
  } catch (e) {
    return NextResponse.json({ error: "Proxy error", detail: String(e) }, { status: 500 })
  }
}
