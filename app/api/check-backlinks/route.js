import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function isBlockedHost(hostname) {
  const h = hostname.toLowerCase();
  return (
    h === 'localhost' ||
    h === '0.0.0.0' ||
    h === '[::1]' ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    /^169\.254\./.test(h)
  );
}

export async function POST(request) {
  try {
    const { targetUrl } = await request.json();
    if (!targetUrl) {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    }

    let pageUrl;
    try {
      pageUrl = new URL(/^https?:\/\//i.test(targetUrl) ? targetUrl : `https://${targetUrl}`);
    } catch {
      return NextResponse.json({ message: 'Invalid URL' }, { status: 400 });
    }
    if (isBlockedHost(pageUrl.hostname)) {
      return NextResponse.json({ message: 'That address is not allowed' }, { status: 400 });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let res;
    try {
      res = await fetch(pageUrl.toString(), {
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'RankinSEOLinkBot/1.0' },
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return NextResponse.json({ message: `Could not load that page (status ${res.status})` }, { status: 502 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const detectedLinks = [];
    const seen = new Set();

    $('a[href]').each((i, element) => {
      let abs;
      try {
        abs = new URL($(element).attr('href'), pageUrl);
      } catch {
        return;
      }
      if (!['http:', 'https:'].includes(abs.protocol)) return;
      if (abs.hostname === pageUrl.hostname) return; // skip internal links
      if (seen.has(abs.href)) return;
      seen.add(abs.href);

      const text = $(element).text().trim() || 'View Link';
      const rel = $(element).attr('rel') || '';
      detectedLinks.push({
        source: abs.href,
        anchor: text.length > 40 ? text.substring(0, 40) + '...' : text,
        isNoFollow: rel.includes('nofollow'),
      });
    });

    return NextResponse.json({
      totalBacklinks: detectedLinks.length,
      domainAuthority: null,
      referringDomains: new Set(detectedLinks.map((l) => new URL(l.source).hostname)).size,
      links: detectedLinks.slice(0, 10),
    });
  } catch (error) {
    const message = error.name === 'AbortError' ? 'The page took too long to respond' : error.message;
    return NextResponse.json({ message }, { status: 500 });
  }
}