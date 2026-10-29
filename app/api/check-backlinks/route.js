import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { lookup } from 'node:dns/promises';
import net from 'node:net';

export const runtime = 'nodejs';

const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;
const MAX_BYTES = 2 * 1024 * 1024; // read at most 2 MB of the page
const MAX_LINKS_SHOWN = 10;

class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function isPrivateIPv4(ip) {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIPv6(ip) {
  const a = ip.toLowerCase().replace(/^\[|\]$/g, '');
  const dotted = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return isPrivateIPv4(dotted[1]);
  const hex = a.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return isPrivateIPv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  if (a.startsWith('::')) return true; // ::, ::1 and other reserved forms
  if (a.startsWith('64:ff9b:')) return true;
  return /^f[cd]/.test(a) || /^fe[89ab]/.test(a); // unique-local and link-local
}

function isBlockedAddress(ip) {
  const kind = net.isIP(ip);
  if (kind === 4) return isPrivateIPv4(ip);
  if (kind === 6) return isPrivateIPv6(ip);
  return true;
}

function isBlockedHostname(hostname) {
  const h = hostname.toLowerCase().replace(/\.$/, '');
  const bare = h.replace(/^\[|\]$/g, '');
  if (net.isIP(bare)) return isBlockedAddress(bare);
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (!h.includes('.')) return true; // single-word names such as "intranet"
  return false;
}

async function assertPublicUrl(url) {
  if (!['http:', 'https:'].includes(url.protocol)) throw new HttpError('Invalid URL', 400);
  if (url.username || url.password) throw new HttpError('That address is not allowed', 400);
  if (url.port && !['80', '443'].includes(url.port)) throw new HttpError('That address is not allowed', 400);
  if (isBlockedHostname(url.hostname)) throw new HttpError('That address is not allowed', 400);

  const bare = url.hostname.replace(/^\[|\]$/g, '');
  if (!net.isIP(bare)) {
    let addrs;
    try {
      addrs = await lookup(bare, { all: true });
    } catch {
      throw new HttpError('Could not find that website', 400);
    }
    if (!addrs.length || addrs.some((a) => isBlockedAddress(a.address))) {
      throw new HttpError('That address is not allowed', 400);
    }
  }
}

async function fetchPage(startUrl, signal) {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(current);
    const res = await fetch(current.toString(), {
      signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'RankinSEOLinkBot/1.0' },
    });
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      try {
        current = new URL(location, current);
      } catch {
        throw new HttpError('Invalid redirect', 502);
      }
      continue;
    }
    return { res, finalUrl: current };
  }
  throw new HttpError('Too many redirects', 400);
}

async function readLimited(res) {
  const type = res.headers.get('content-type') || '';
  if (!/text\/html|application\/xhtml/i.test(type)) {
    throw new HttpError('That address is not a web page', 400);
  }
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (total + value.length > MAX_BYTES) {
      chunks.push(value.subarray(0, MAX_BYTES - total)); // keep the part that fits
      reader.cancel().catch(() => {});
      break;
    }
    total += value.length;
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

const stripWww = (h) => h.toLowerCase().replace(/^www\./, '');

export async function POST(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const { targetUrl } = await request.json();
    if (!targetUrl || typeof targetUrl !== 'string') {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    }

    let pageUrl;
    try {
      pageUrl = new URL(/^https?:\/\//i.test(targetUrl) ? targetUrl : `https://${targetUrl}`);
    } catch {
      return NextResponse.json({ message: 'Invalid URL' }, { status: 400 });
    }

    const { res, finalUrl } = await fetchPage(pageUrl, controller.signal);
    if (!res.ok) {
      return NextResponse.json({ message: `Could not load that page (status ${res.status})` }, { status: 502 });
    }

    const html = await readLimited(res);
    const $ = cheerio.load(html);
    const ownHost = stripWww(finalUrl.hostname);
    const detectedLinks = [];
    const seen = new Set();

    $('a[href]').each((i, element) => {
      let abs;
      try {
        abs = new URL($(element).attr('href'), finalUrl);
      } catch {
        return;
      }
      if (!['http:', 'https:'].includes(abs.protocol)) return;
      if (stripWww(abs.hostname) === ownHost) return; // skip internal links
      if (seen.has(abs.href)) return;
      seen.add(abs.href);

      const text = $(element).text().trim() || 'View Link';
      const rel = $(element).attr('rel') || '';
      detectedLinks.push({
        source: abs.href,
        anchor: text.length > 40 ? text.substring(0, 40) + '...' : text,
        isNoFollow: /\bnofollow\b/i.test(rel),
      });
    });

    return NextResponse.json({
      totalBacklinks: detectedLinks.length,
      shownLinks: Math.min(detectedLinks.length, MAX_LINKS_SHOWN),
      domainAuthority: null,
      referringDomains: new Set(detectedLinks.map((l) => new URL(l.source).hostname)).size,
      links: detectedLinks.slice(0, MAX_LINKS_SHOWN),
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error && error.name === 'AbortError') {
      return NextResponse.json({ message: 'The page took too long to respond' }, { status: 504 });
    }
    console.error('check-backlinks failed:', error && error.message);
    return NextResponse.json({ message: 'Could not check that page. Please try again.' }, { status: 500 });
  } finally {
    clearTimeout(timer);
  }
}
