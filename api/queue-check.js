import fetch from 'node-fetch';
import { getAccessToken } from './callback.js';

export default async function handler(req, res) {
  const token = getAccessToken();
  if (!token) {
    return res.status(401).json({ error: "No access token. Visit /api/auth first." });
  }

  try {
    const response = await fetch("https://api.livechatinc.com/v3.5/reports/agents", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const raw = await response.text();
    try {
      const json = JSON.parse(raw);
      res.status(200).json(json);
    } catch {
      res.status(500).json({ error: "Failed to parse JSON", raw });
    }
  } catch (err) {
    res.status(500).json({ error: "Queue check failed", details: err.message });
  }
}
