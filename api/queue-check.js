// /api/test-agent.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const accessToken = process.env.ACCESS_TOKEN;

    const response = await fetch('https://api.livechatinc.com/v3.5/agents/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      res.status(200).json({ message: 'Agent info fetched', data: json });
    } catch (parseError) {
      res.status(500).json({ error: 'Non-JSON response', raw: text });
    }
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed', details: err.message });
  }
}
