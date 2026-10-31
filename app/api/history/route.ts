import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BLOG_OWNER_USER_ID } from '@/lib/blogOwner';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, keyword, created_at, content, status, seo_score, seo_score_breakdown')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: `Supabase database error: ${error.message}` }, { status: 500 });
    }

    const formattedCampaigns = campaigns?.map(item => ({
      id: item.id,
      keyword: item.keyword,
      created_at: item.created_at,
      html_content: item.content || "",
      status: item.status || "pending_review",
      seo_score: item.seo_score ?? null,
      seo_score_breakdown: item.seo_score_breakdown ?? null
    }));

    // Tells the dashboard whether this user is the blog owner (publishes) or a customer (exports).
    return NextResponse.json(formattedCampaigns || [], {
      headers: { 'X-Blog-Owner': user.id === BLOG_OWNER_USER_ID ? '1' : '0' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to communicate with database.", details: err.message }, { status: 500 });
  }
}