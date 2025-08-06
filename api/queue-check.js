export default async function handler(req, res) {
  const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

  const accessToken = process.env.LIVECHAT_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({ error: 'No access token provided' });
  }

  try {
    const response = await fetch('https://api.livechatinc.com/v3.5/reports/chats/summary', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!isJson) {
      const text = await response.text();
      throw new Error(`Non-JSON response: ${text}`);
    }

    const data = await response.json();
    console.log("📊 LiveChat summary report:", data);

    res.status(200).json(data);
  } catch (err) {
    console.error("Queue check error:", err);
    res.status(500).json({ error: 'Queue check failed', details: err.message });
  }
}
