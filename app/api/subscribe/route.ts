// ❌ CHANGE THIS LINE:
// import { supabaseAdmin } from '@/lib/supabase';

//  TO THIS EXACT RELATIVE PATH:
import { supabaseAdmin } from '../../../lib/supabase';


export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), { status: 400 });
    }

    const { error } = await supabaseAdmin.from('subscribers').insert({ email: email.trim().toLowerCase() });

    if (error) {
      console.error('Supabase insert error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
