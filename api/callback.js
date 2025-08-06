import fetch from 'node-fetch';

let access_token = null; // TEMPORARY in-memory storage

export default async function handler(req, res) {
  const code = req.query.code;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = "https://YOUR-VERCEL-URL.vercel.app/api/callback";

  try {
    const tokenRes = await fetch("https://accounts.livechat.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenRes.json();
    access_token = tokenData.access_token;

    if (!access_token) {
      console.error("❌ No token returned:", tokenData);
      return res.status(500).json({ error: "Failed to retrieve token", details: tokenData });
    }

    console.log("✅ Access Token Saved:", access_token);
    res.send("✅ Authorization complete. You can now call /api/queue-check.");
  } catch (err) {
    console.error("❌ Callback error:", err);
    res.status(500).json({ error: "Callback failed", details: err.message });
  }
}

export function getAccessToken() {
  return access_token;
}
