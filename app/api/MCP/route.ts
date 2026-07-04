import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Extract values sent from your sunset dashboard frontend
    const { keyword, html_content } = await request.json();

    if (!keyword || !html_content) {
      return NextResponse.json({ error: 'Missing keyword or html_content' }, { status: 400 });
    }

    // 2. Safely capture your synced token from the local environment block
    const token = process.env.CMS_API_TOKEN;
    
    // 3. Webflow V2 API requires a target Collection ID string
    // TODO: Replace this placeholder string with your copied Webflow Collection ID
    const collectionId = 'YOUR_WEBFLOW_COLLECTION_ID_HERE'; 

    if (!token || collectionId === '6a490b7687e679d5400a4e4b') {
      return NextResponse.json({ error: 'Server authentication configuration incomplete' }, { status: 500 });
    }

    // 4. Dispatch the content payload directly to the Webflow Collection engine
    const response = await fetch(`https://webflow.com{collectionId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isArchived: false,
        isDraft: true, // Pushes to Webflow as a clean draft so you can review before publishing live
        fieldData: {
          name: keyword,       // Maps keyword to the Post Title slot
          slug: keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), // Safe URL optimization
          'post-body': html_content, // Maps generated HTML text to the Rich Text block
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Webflow Sync Failed', details: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Draft exported cleanly via MCP!', data });
    
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal pipeline error', message: error.message }, { status: 500 });
  }
}
