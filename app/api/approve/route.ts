import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';
import { notifyGoogleIndexing } from '@/lib/googleIndexing';
import { BLOG_OWNER_USER_ID } from '@/lib/blogOwner';

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

    // Approve only the caller's own article, and keep the slug it was saved with.
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'approved' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, slug');

    if (error) {
      return new Response(JSON.stringify({ error: 'Could not approve the article. Please try again.' }), { status: 500 });
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No matching campaign found to approve.' }),
        { status: 404 }
      );
    }

    // Only the blog owner's articles are published and reported to Google.
    const published = user.id === BLOG_OWNER_USER_ID;
    const slug = data[0].slug;
    if (published && slug) {
      await notifyGoogleIndexing(`https://rankinseo.xyz/blog/${slug}/`);
    }

    return new Response(JSON.stringify({ success: true, published }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500 });
  }
}
