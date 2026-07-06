import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Campaign id is required' }), { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}