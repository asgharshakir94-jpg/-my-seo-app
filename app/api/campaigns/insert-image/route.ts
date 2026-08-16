import { supabaseAdmin } from '@/lib/supabase';
import { computeArticleScore } from '@/lib/seoScore';

export async function POST(req: Request) {
  try {
    const { id, position, imageUrl, alt, credit, creditUrl } = await req.json();

    if (!id || !position || !imageUrl) {
      return new Response(JSON.stringify({ error: 'id, position, and imageUrl are required' }), { status: 400 });
    }

    const { data: campaign, error: fetchErr } = await supabaseAdmin
      .from('campaigns')
      .select('content, keyword')
      .eq('id', id)
      .single();

    if (fetchErr || !campaign?.content) {
      return new Response(JSON.stringify({ error: 'Campaign not found or has no content' }), { status: 404 });
    }

    const imageHtml = `<img src="${imageUrl}" alt="${(alt || '').replace(/"/g, '&quot;')}" style="width:100%;border-radius:8px;margin:1rem 0 0.5rem;" />\n<p style="font-size:0.8rem;color:#888;margin-bottom:1rem;">Photo by <a href="${creditUrl}?utm_source=rankinseo&utm_medium=referral" target="_blank" rel="noopener">${credit}</a> on <a href="https://unsplash.com?utm_source=rankinseo&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a></p>\n`;

    let newContent: string;

    if (position.type === 'top') {
      const h1Match = campaign.content.match(/<h1[^>]*>.*?<\/h1>/i);
      if (h1Match) {
        const insertAt = h1Match.index! + h1Match[0].length;
        newContent = campaign.content.slice(0, insertAt) + '\n' + imageHtml + campaign.content.slice(insertAt);
      } else {
        newContent = imageHtml + campaign.content;
      }
    } else {
      const h2Regex = /<h2[^>]*>.*?<\/h2>/gi;
      const matches = [...campaign.content.matchAll(h2Regex)];
      const target = matches[position.index];
      if (!target) {
        return new Response(JSON.stringify({ error: 'Heading not found' }), { status: 400 });
      }
      const insertAt = target.index! + target[0].length;
      newContent = campaign.content.slice(0, insertAt) + '\n' + imageHtml + campaign.content.slice(insertAt);
    }

    const { total: seoScore, breakdown: seoScoreBreakdown } = computeArticleScore(newContent, campaign.keyword);

    const { error: updateErr } = await supabaseAdmin
      .from('campaigns')
      .update({ content: newContent, seo_score: seoScore, seo_score_breakdown: seoScoreBreakdown })
      .eq('id', id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: updateErr.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ content: newContent, seo_score: seoScore, seo_score_breakdown: seoScoreBreakdown }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}