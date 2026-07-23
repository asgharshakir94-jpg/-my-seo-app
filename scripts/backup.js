const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TABLES = ['campaigns', 'subscriptions', 'contact_submissions', 'keyword_suggestions', 'subscribers'];

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(__dirname, '..', 'backups', timestamp);
  fs.mkdirSync(dir, { recursive: true });

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Failed to backup ${table}:`, error.message);
      continue;
    }
    fs.writeFileSync(
      path.join(dir, `${table}.json`),
      JSON.stringify(data, null, 2)
    );
    console.log(`✓ ${table}: ${data.length} rows backed up`);
  }

  console.log(`\nBackup saved to backups/${timestamp}/`);
}

backup();