import fetch from 'node-fetch';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TOKEN_URL = 'https://accounts.livechat.com/token';
const QUEUE_URL = 'https://api.livechatinc.com/v3.5/reports/agents';

export default async function handler(req, res) {
  try {
    // Step 1: Get access token
    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('🔐 Token error:', tokenData);
      return res.status(500).json({ error: 'Token fetch failed', details: tokenData });
    }

    const accessToken = tokenData.access_token;

    // Step 2: Fetch agent reports
    const reportsResponse = await fetch(QUEUE_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const rawText = await reportsResponse.text();
    try {
      const reportData = JSON.parse(rawText);

      // Example: check if total chats in queue > 3
      const totalChats = reportData.total_chats || 0;

      if (totalChats > 3) {
        // TODO: Add MS Teams webhook notification here
        return res.status(200).json({ status: 'ALERT', totalChats });
      } else {
        return res.status(200).json({ status: 'OK', totalChats });
      }
    } catch (jsonError) {
      console.error('❌ Failed to parse JSON:', rawText);
      return res.status(500).json({
        error: 'Failed to parse response',
        raw_response: rawText,
      });
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ error: 'Queue check failed', details: err.message });
  }
}
