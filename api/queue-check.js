import fetch from 'node-fetch';

export default async function handler(req, res) {
  const accessToken = process.env.LIVECHAT_ACCESS_TOKEN; // Temporary for testing

  if (!accessToken) {
    return res.status(500).json({ error: 'No access token provided' });
  }

  try {
    const response = await fetch('https://api.livechatinc.com/v3.5/reports/agents', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Queue check error:", err);
    res.status(500).json({ error: 'Queue check failed', details: err.message });
  }
}
