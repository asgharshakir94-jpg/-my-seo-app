import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { notifyGoogleIndexing } from '../lib/googleIndexing';

// Force absolute path resolution for your environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase URL or Service Role Key in environment variables.");
}

// Create a dedicated admin client just for this execution
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});


async function backfill() {
  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select('slug')
    .eq('status', 'approved')
    .not('slug', 'is', null);

  if (error) {
    console.error('Failed to fetch campaigns:', error.message);
    return;
  }

  if (!campaigns || campaigns.length === 0) {
    console.log('No approved campaigns found.');
    return;
  }

  console.log(`Found ${campaigns.length} approved articles. Starting backfill...`);

  let success = 0;
  let failed = 0;

  for (const campaign of campaigns) {
    const url = `https://rankinseo.xyz/blog/${campaign.slug}`;
    const result = await notifyGoogleIndexing(url);

    if (result) {
      success++;
      console.log(`[${success + failed}/${campaigns.length}] OK: ${url}`);
    } else {
      failed++;
      console.log(`[${success + failed}/${campaigns.length}] FAILED: ${url}`);
    }

    // Small delay to be polite to the API — avoids hammering it in a tight loop
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
}

backfill();