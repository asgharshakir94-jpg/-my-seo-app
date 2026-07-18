import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { campaignId, keyword, html_content } = await request.json();

    if (!campaignId || !keyword || !html_content) {
      return NextResponse.json({ error: 'Missing campaignId, keyword, or html_content' }, { status: 400 });
    }

    // Server-side gate: never trust client-reported status. Look the campaign
    // up directly and refuse export unless it's actually been approved.
    const { data: campaign, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('status, user_id')
      .eq('id', campaignId)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized for this campaign' }, { status: 403 });
    }

    if (campaign.status !== 'approved') {
      return NextResponse.json(
        { error: `Campaign must be approved before export (current status: ${campaign.status})` },
        { status: 403 }
      );
    }

    const token = process.env.CMS_API_TOKEN;
    const collectionId = '6a490b7687e679d5400a4e4b';

    if (!token) {
      return NextResponse.json({ error: 'CMS_API_TOKEN variable is not injected into Vercel settings' }, { status: 500 });
    }

    const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        isArchived: false,
        isDraft: true, 
        fieldData: {
          name: keyword,       
          slug: keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), 
          'post-body': html_content, 
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Webflow pipeline refused authentication', details: data }, { status: response.status });
    }

    const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'exported',
        slug: slug,
        })
      .eq('id', campaignId);

    return NextResponse.json({ success: true, message: 'Draft exported cleanly via MCP!', data });
    
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server route exception caught', message: error.message }, { status: 500 });
  }
}
