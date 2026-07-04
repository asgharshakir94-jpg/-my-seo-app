import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET() {
  try {
    // Selects your exact table columns: html_content instead of content
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, keyword, created_at, content')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Map html_content to content key for the frontend component contract compatibility
    const mappedData = (data || []).map(item => ({
      id: item.id,
      keyword: item.keyword,
      created_at: item.created_at,
      content: item.content
    }));

    return NextResponse.json(mappedData);
  } catch (err) {
    return NextResponse.json({ error: "Failed to communicate with database." }, { status: 500 });
  }
}
