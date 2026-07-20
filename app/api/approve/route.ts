import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Campaign id is required' }), { status: 400 });
    }

    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('keyword')
      .eq('id', id)
      .single();

    const slug = campaign?.keyword
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'approved', slug })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}