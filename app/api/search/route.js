import { NextResponse } from "next/server"

const SUPABASE_URL = "https://sotlivluneouoaptserx.supabase.co"
const SUPABASE_KEY = process.env.SUPABASE_KEY

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const select = searchParams.get("select") || "*"
    const jurisdiction = searchParams.get("jurisdiction")
    const source_type = searchParams.get("source_type")
    const citation = searchParams.get("citation")
    const date = searchParams.get("date")
    const id = searchParams.get("id")
    const order = searchParams.get("order")
    let limit = searchParams.get("limit") || "10"
    let offset = searchParams.get("offset") || "0"

    if (!SUPABASE_KEY) {
      return NextResponse.json({ error: "Missing SUPABASE_KEY" }, { status: 500 })
    }

    limit = String(Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100))
    offset = String(Math.max(Number.parseInt(offset, 10) || 0, 0))

    const url = new URL(`${SUPABASE_URL}/rest/v1/legal_archive`)
    url.searchParams.set("select", select)

    if (jurisdiction) url.searchParams.set("jurisdiction", jurisdiction)
    if (source_type) url.searchParams.set("source_type", source_type)
    if (citation) url.searchParams.set("citation", citation)
    if (date) url.searchParams.set("date", date)
    if (id) url.searchParams.set("id", id)
    if (order) url.searchParams.set("order", order)

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
