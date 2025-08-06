import fetch from 'node-fetch';

export default async function handler(req, res) {
  const code = req.query.code;
  const clientId = process.env.LIVECHAT_CLIENT_ID;
  const clientSecret = process.env.LIVECHAT_CLIENT_SECRET;
  const redirectUri = "https://queuesizealert-ludwig-06082025.vercel.app/callback";

  if (!code) {
    return res.status(400).send("Missing authorization code.");
  }

  try {
    // Step 1: Exchange code for access token
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

    const accessToken = tokenData.access_token;

   // Step 2: Try calling the Agents API v3.4
const agentResponse = await fetch("https://api.livechatinc.com/v3.4/agents", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  }
});

const raw = await agentResponse.text();
console.log("📄 Raw response from /agents:", raw);

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error("❌ Failed to parse JSON:", e.message);
  return res.status(500).json({
    error: "Callback failed",
    details: "Could not parse API response as JSON. See logs.",
    raw_response: raw
  });
}

return res.status(200).json({
  message: "Authorization successful!",
  access_token: accessToken,
  api_response: data
});
