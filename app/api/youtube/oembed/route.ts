import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("v");
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  // Method 1: Scrape title from YouTube page HTML (most reliable)
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (res.ok) {
      const html = await res.text();
      // Try og:title meta tag first
      const ogMatch = html.match(
        /<meta\s+property="og:title"\s+content="([^"]+)"/
      );
      if (ogMatch?.[1]) {
        return NextResponse.json({ title: decodeHTMLEntities(ogMatch[1]), thumbnail });
      }
      // Fallback: <title> tag (usually "Title - YouTube")
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      if (titleMatch?.[1]) {
        const raw = titleMatch[1].replace(/ - YouTube$/, "").trim();
        if (raw && raw !== "YouTube") {
          return NextResponse.json({ title: decodeHTMLEntities(raw), thumbnail });
        }
      }
    }
  } catch {}

  // Method 2: Try noembed (free oEmbed proxy)
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`,
    );
    if (res.ok) {
      const data = await res.json();
      if (data.title && !data.error) {
        return NextResponse.json({ title: data.title, thumbnail });
      }
    }
  } catch {}

  // Method 3: YouTube oEmbed directly (server-side)
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
    );
    if (res.ok) {
      const data = await res.json();
      if (data.title) {
        return NextResponse.json({ title: data.title, thumbnail });
      }
    }
  } catch {}

  // Last resort
  return NextResponse.json({ title: `YouTube Video (${videoId})`, thumbnail });
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&apos;/g, "'");
}
