import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { keyword, html_content } = await request.json();

    if (!keyword || !html_content) {
      return NextResponse.json({ error: 'Missing keyword or html_content' }, { status: 400 });
    }

    const token = process.env.CMS_API_TOKEN;
    const collectionId = '6a490b7687e679d5400a4e4b'; // Verified Collection ID from Webflow dashboard // Verified Collection ID from Webflow dashboard

    if (!token) {
      return NextResponse.json({ error: 'CMS_API_TOKEN variable is not injected into Vercel settings' }, { status: 500 });
    }

    // Connects out dynamically via standard fetch to Webflow's remote database layout
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

    return NextResponse.json({ success: true, message: 'Draft exported cleanly via MCP!', data });
    
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server route exception caught', message: error.message }, { status: 500 });
  }
}
