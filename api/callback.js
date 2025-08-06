import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.LIVECHAT_CLIENT_ID;
  const clientSecret = process.env.LIVECHAT_CLIENT_SECRET;
  const redirectUri = process.env.LIVECHAT_REDIRECT_URI;

  const tokenResponse = await fetch('https://accounts.livechat.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    })
  });

  const tokenData = await tokenResponse.json();
  console.log("🔐 Token Response:", tokenData);

  if (!tokenData.access_token) {
    return res.status(500).json({ error: 'Token exchange failed', details: tokenData });
  }

  // You can optionally save the tokens in a DB or cookie
  res.status(200).json({ message: 'Auth successful', tokenData });
}
