import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const res = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankinSEOAuditBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Could not fetch site (status ${res.status})` }),
        { status: 422 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const checks: { id: string; label: string; passed: boolean; detail: string }[] = [];

    const title = $('title').first().text().trim();
    checks.push({
      id: 'title',
      label: 'Title tag',
      passed: title.length > 0 && title.length <= 60,
      detail: title ? `"${title}" (${title.length} chars)` : 'No title tag found',
    });

    const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
    checks.push({
      id: 'meta_description',
      label: 'Meta description',
      passed: metaDesc.length > 0 && metaDesc.length <= 160,
      detail: metaDesc ? `Present, ${metaDesc.length} chars` : 'No meta description found',
    });

    const h1Count = $('h1').length;
    checks.push({
      id: 'h1',
      label: 'H1 tag',
      passed: h1Count === 1,
      detail: h1Count === 0 ? 'No H1 found' : h1Count === 1 ? 'Exactly one H1 found' : `${h1Count} H1 tags found (should be 1)`,
    });

    const images = $('img');
    const totalImages = images.length;
    const missingAlt = images.filter((_, el) => !$(el).attr('alt')?.trim()).length;
    checks.push({
      id: 'image_alt',
      label: 'Image alt text',
      passed: totalImages === 0 || missingAlt === 0,
      detail: totalImages === 0 ? 'No images found' : `${missingAlt} of ${totalImages} images missing alt text`,
    });

    const bodyText = html.toLowerCase();
    const hasGbpLink =
      bodyText.includes('google.com/maps') ||
      bodyText.includes('maps.google.com') ||
      bodyText.includes('g.page/') ||
      bodyText.includes('business.google.com');
    checks.push({
      id: 'gbp_link',
      label: 'Google Business Profile link',
      passed: hasGbpLink,
      detail: hasGbpLink ? 'GBP or Maps link found' : 'No GBP or Maps link found',
    });

    const hasTelLink = $('a[href^="tel:"]').length > 0;
    checks.push({
      id: 'click_to_call',
      label: 'Mobile click-to-call',
      passed: hasTelLink,
      detail: hasTelLink ? 'tel: link found' : 'No tel: link found',
    });

    const hasFacebook = bodyText.includes('facebook.com/');
    const hasInstagram = bodyText.includes('instagram.com/');
    const hasLinkedIn = bodyText.includes('linkedin.com/');
    const socialCount = [hasFacebook, hasInstagram, hasLinkedIn].filter(Boolean).length;
    checks.push({
      id: 'social_links',
      label: 'Social links',
      passed: socialCount > 0,
      detail: socialCount > 0 ? `${socialCount} platform(s) linked` : 'No social links found',
    });

    const hasViewport = $('meta[name="viewport"]').length > 0;
    checks.push({
      id: 'viewport',
      label: 'Mobile viewport tag',
      passed: hasViewport,
      detail: hasViewport ? 'Viewport meta tag present' : 'No viewport meta tag found',
    });

    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return new Response(JSON.stringify({ url: targetUrl, score, checks }), { status: 200 });
  } catch (err: any) {
    if (err.name === 'TimeoutError') {
      return new Response(JSON.stringify({ error: 'Site took too long to respond' }), { status: 408 });
    }
    return new Response(JSON.stringify({ error: err.message || 'Audit failed' }), { status: 500 });
  }
}