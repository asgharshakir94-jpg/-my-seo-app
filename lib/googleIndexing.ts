import { google } from 'googleapis';

const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY
  ? process.env.GOOGLE_INDEXING_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
  : '';

const jwtClient = new google.auth.JWT({
  email: process.env.GOOGLE_INDEXING_CLIENT_EMAIL,
  key: privateKey,
  scopes: ['https://googleapis.com'],
});

export async function notifyGoogleIndexing(url: string) {
  try {
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
