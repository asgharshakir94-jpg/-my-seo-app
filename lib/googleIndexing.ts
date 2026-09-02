import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export async function notifyGoogleIndexing(url: string) {
  try {
    let clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;

    // LOCAL TERMINAL FALLBACK: If process.env is blank, manually open and read the file
    if (!clientEmail || !privateKey) {
      try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          
          // Match lines looking like "client_email": "..." or client_email="..."
          const emailMatch = envContent.match(/(?:"client_email"|client_email)\s*[:=]\s*"([^"]+)"/);
          const keyMatch = envContent.match(/(?:"private_key"|private_key)\s*[:=]\s*"([^"]+)"/);

          if (emailMatch) clientEmail = emailMatch[1];
          if (keyMatch) privateKey = keyMatch[1].replace(/\\n/g, '\n');
        }
      } catch (fileErr) {
        console.error("Local .env.local file parsing helper failed:", fileErr);
      }
    }

    if (!privateKey || !clientEmail) {
      console.error(`[Error] Missing Google credentials. Keys could not be resolved for URL: ${url}`);
      return null;
    }

    // Initialize the official JWT connection client using the verified keys
    const jwtClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://googleapis.com'],
    });

    await jwtClient.authorize();
    const indexing = google.indexing({ version: 'v3', auth: jwtClient });

    const res = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });

    console.log(`Indexing API notified for: ${url}`);
    return res.data;
  } catch (err) {
    console.error(`Indexing API error for ${url}:`, err);
    return null;
  }
}
