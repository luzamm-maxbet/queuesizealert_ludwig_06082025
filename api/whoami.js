import fetch from 'node-fetch';

export default async function handler(req, res) {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const tokenResponse = await fetch('https://accounts.livechat.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const whoamiRes = await fetch('https://api.livechatinc.com/v3.5/agent/action/whoami', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const rawText = await whoamiRes.text();
  try {
    const json = JSON.parse(rawText);
    return res.status(200).json(json);
  } catch {
    return res.status(500).json({ error: 'Failed to parse whoami', rawText });
  }
}
