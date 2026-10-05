import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Keep this the same as in the search route.
const REQUIRE_VERIFIED = true;

const COUNTRIES = ['US', 'CA', 'UK'];
const HOME_TRADE_WORDS = [
  'plumb', 'roof', 'hvac', 'solar', 'electric', 'carpent', 'landscap',
  'paint', 'construct', 'build', 'contractor', 'handyman', 'clean',
  'pest', 'garage', 'floor', 'remodel', 'gutter', 'window', 'home',
];
const TYPE_LABELS = {
  directory: 'Directory',
  guest_post: 'Guest post',
  citation: 'Local citation',
  resource_page: 'Resource page',
};

// pdf-lib's standard fonts only handle basic characters, so strip the rest.
const ascii = (s) => String(s ?? '').replace(/[^\x20-\x7E]/g, '').trim();

async function buildPdf({ niche, country, rows }) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595;
  const H = 842;
  const M = 50;
  const maxW = W - M * 2;
  let page = pdf.addPage([W, H]);
  let y = H - M;

  const fit = (text, size, f) => {
    let t = ascii(text);
    while (t.length > 3 && f.widthOfTextAtSize(t, size) > maxW) t = t.slice(0, -4) + '...';
    return t;
  };
  const line = (text, { size = 10, f = font, color = rgb(0.1, 0.1, 0.1), gap = 4 } = {}) => {
    if (y < M + size) {
      page = pdf.addPage([W, H]);
      y = H - M;
    }
    page.drawText(fit(text, size, f), { x: M, y: y - size, size, font: f, color });
    y -= size + gap;
  };

  line('Backlink Opportunities', { size: 22, f: bold, gap: 8 });
  line(`Niche: ${niche}   |   Country: ${country}   |   ${new Date().toISOString().slice(0, 10)}`, {
    size: 10,
    color: rgb(0.35, 0.35, 0.35),
    gap: 6,
  });
  line('Sites ranked by Open PageRank authority score (0-10). Always confirm the current', { size: 9, color: rgb(0.35, 0.35, 0.35), gap: 2 });
  line('requirements and pricing on each site before you submit. No placement is guaranteed.', { size: 9, color: rgb(0.35, 0.35, 0.35), gap: 14 });

  rows.forEach((r, i) => {
    const name = r.site_name || r.domain;
    const url = r.submit_url || r.contact_url || `https://${r.domain}`;
    const score = r.authority_score != null ? `${Number(r.authority_score).toFixed(1)}/10` : 'not yet rated';
    line(`${i + 1}. ${name} (${r.domain})`, { size: 12, f: bold, gap: 3 });
    line(`Type: ${TYPE_LABELS[r.type] || r.type}   |   Authority score: ${score}`, { size: 10, gap: 3 });
    line(`Where to submit: ${url}`, { size: 10, color: rgb(0.1, 0.25, 0.6), gap: 12 });
  });

  line('Prepared by RankinSEO - rankinseo.xyz', { size: 9, color: rgb(0.45, 0.45, 0.45) });
  return pdf.save();
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Honeypot: real people never fill this hidden field.
    if (body.website) return NextResponse.json({ ok: true });

    const email = String(body.email || '').trim().toLowerCase().slice(0, 200);
    const businessName = String(body.businessName || '').trim().slice(0, 120);
    const niche = String(body.niche || '').trim().toLowerCase().slice(0, 80);
    const countryRaw = String(body.country || 'US').trim().toUpperCase();
    const country = COUNTRIES.includes(countryRaw) ? countryRaw : 'US';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address' }, { status: 400 });
    }
    if (body.consent !== true) {
      return NextResponse.json({ message: 'Please tick the consent box to receive the PDF' }, { status: 400 });
    }
    if (niche.length < 2) {
      return NextResponse.json({ message: 'Please enter your niche first' }, { status: 400 });
    }
    if (!process.env.RESEND_API_KEY || !process.env.FINDER_FROM_EMAIL) {
      console.error('Missing RESEND_API_KEY or FINDER_FROM_EMAIL');
      return NextResponse.json({ message: 'Email is not set up yet, please try later' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Limit: 3 requests per email per 24 hours.
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count: recent } = await supabase
      .from('prospect_leads')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', since);
    if ((recent ?? 0) >= 3) {
      return NextResponse.json({ message: 'You have reached the daily limit. Please try again tomorrow.' }, { status: 429 });
    }

        // Daily cap, to stay under the email provider's free daily limit.
        const { count: sentToday } = await supabase
        .from('prospect_leads')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since);
      if ((sentToday ?? 0) >= 80) {
        return NextResponse.json(
          { message: "We've reached today's limit of free reports. Please try again tomorrow." },
          { status: 429 }
        );
      }
  
      const isHomeTrade = HOME_TRADE_WORDS.some((w) => niche.includes(w));
      const words = niche.split(/[^a-z]+/).filter(Boolean);
      const hasWord = (list) => list.some((w) => words.includes(w));
      const niches = ['general', niche];
      if (isHomeTrade) niches.push('home services');
      if (hasWord(['saas', 'software', 'startup', 'tech', 'app', 'apps', 'ai'])) niches.push('software');
      if (hasWord(['agency', 'marketing', 'seo', 'advertising', 'design'])) niches.push('marketing agency');

    let query = supabase
      .from('link_prospects')
      .select('domain, site_name, type, authority_score, submit_url, contact_url')
      .eq('country', country)
      .in('niche', niches)
      .eq('is_free', true)
      .order('authority_score', { ascending: false, nullsFirst: false })
      .limit(100);
    if (REQUIRE_VERIFIED) query = query.not('verified_at', 'is', null);

    const { data: rows, error } = await query;
    if (error || !rows) {
      return NextResponse.json({ message: 'Could not build your list, please try again' }, { status: 500 });
    }
    if (rows.length === 0) {
      return NextResponse.json({ message: 'No opportunities found for that niche yet' }, { status: 404 });
    }

    // Save the lead (with consent) before sending.
    const { error: leadError } = await supabase.from('prospect_leads').insert({
      email,
      business_name: businessName || null,
      trade: niche,
      country,
      consent: true,
    });
    if (leadError) {
      return NextResponse.json({ message: 'Something went wrong, please try again' }, { status: 500 });
    }

    const pdfBytes = await buildPdf({ niche: ascii(niche), country, rows });

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FINDER_FROM_EMAIL,
        to: [email],
        subject: `Your backlink opportunities list (${rows.length} sites)`,
        html:
          `<p>Hi${businessName ? ' ' + ascii(businessName) : ''},</p>` +
          `<p>Your list of ${rows.length} backlink opportunities for "${ascii(niche)}" is attached as a PDF.</p>` +
          `<p>Check each site's requirements and pricing before you submit. No placement is guaranteed.</p>` +
          `<p>- RankinSEO<br/>https://rankinseo.xyz</p>`,
        attachments: [
          {
            filename: 'backlink-opportunities.pdf',
            content: Buffer.from(pdfBytes).toString('base64'),
          },
        ],
      }),
    });

    if (!emailRes.ok) {
      console.error('Resend error status:', emailRes.status);
      return NextResponse.json({ message: 'We could not send the email. Please try again later.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('report route error:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}