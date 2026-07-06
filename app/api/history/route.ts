import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Server credentials missing inside environment variables" }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, keyword, created_at, content, status') 
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: `Supabase database error: ${error.message}` }, { status: 500 });
    }

    const formattedCampaigns = campaigns?.map(item => ({
      id: item.id,
      keyword: item.keyword,
      created_at: item.created_at,
      html_content: item.content || "",
      status: item.status || "pending_review"
    }));

    return NextResponse.json(formattedCampaigns || []);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to communicate with database.", details: err.message }, { status: 500 });
  }
}