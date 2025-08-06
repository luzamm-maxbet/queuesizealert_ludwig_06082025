import fetch from "node-fetch";

export default async function handler(req, res) {
  const code = req.query.code;
  const clientId = process.env.LIVECHAT_CLIENT_ID;
  const clientSecret = process.env.LIVECHAT_CLIENT_SECRET;
  const redirectUri = "https://queuesizealert-ludwig-06082025.vercel.app/callback";

  if (!code) return res.status(400).send("Missing code");

  try {
    const tokenRes = await fetch("https://accounts.livechat.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenRes.json();
    console.log("🔐 Token response:", tokenData);

    if (!tokenData.access_token) {
      return res.status(401).json({ error: "Failed to get access token", details: tokenData });
    }

    // Example API call (optional)
    const apiRes = await fetch("https://api.livechatinc.com/v3.5/reports/agents", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const data = await apiRes.json();

    res.status(200).json({
      message: "Authorization successful!",
      access_token: tokenData.access_token,
      api_response: data
    });
  } catch (error) {
    console.error("❌ Callback error:", error);
    res.status(500).json({ error: "Callback failed", details: error.message });
  }
}
