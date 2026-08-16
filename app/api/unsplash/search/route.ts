import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  if (!query) {
    return new Response(JSON.stringify({ error: 'query is required' }), { status: 400 });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return new Response(JSON.stringify({ error: 'Unsplash not configured' }), { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=9&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Unsplash request failed' }), { status: res.status });
    }

    const data = await res.json();
    const results = (data.results || []).map((photo: any) => ({
      id: photo.id,
      thumbUrl: photo.urls.small,
      fullUrl: photo.urls.regular,
      alt: photo.alt_description || query,
      credit: photo.user.name,
      creditUrl: photo.user.links.html,
    }));

    return new Response(JSON.stringify({ results }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Unsplash request error' }), { status: 500 });
  }
}