import { google } from 'googleapis';

let jwtClient: InstanceType<typeof google.auth.JWT> | null = null;

function getJwtClient() {
  if (!jwtClient) {
    jwtClient = new google.auth.JWT({
      email: process.env.GOOGLE_INDEXING_CLIENT_EMAIL,
      key: process.env.GOOGLE_INDEXING_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
  }
  return jwtClient;
}

export async function notifyGoogleIndexing(url: string) {
  try {
    const client = getJwtClient();
    await client.authorize();
    const indexing = google.indexing({ version: 'v3', auth: client });

    const res = await indexing.urlNotifications.publish({
      requestBody: {
        url,
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