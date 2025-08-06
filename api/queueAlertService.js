const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  const clientId = process.env.LIVECHAT_CLIENT_ID;
  const clientSecret = process.env.LIVECHAT_CLIENT_SECRET;

  console.log("🔐 CLIENT_ID:", clientId || "Missing ❌");
  console.log("🔐 CLIENT_SECRET:", clientSecret ? "Exists ✅" : "Missing ❌");

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Missing CLIENT_ID or CLIENT_SECRET" });
  }

  try {
    // Step 1: Get access token
    const tokenResponse = await fetch("https://accounts.livechat.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenResponse.json();
    console.log("🔐 Token response:", tokenData);

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return res.status(401).json({ error: "Failed to get access token" });
    }

    // ✅ Step 2: Call Agents API (allowed under agents--all:ro scope)
    const agentResponse = await fetch("https://api.livechatinc.com/v3.4/agents", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const agentData = await agentResponse.json();
    console.log("👤 Agent data response:", agentData);

    return res.status(200).json({
      agents: agentData,
      message: "Fetched agent profiles successfully"
    });
  } catch (error) {
    console.error("❌ API request failed:", error);
    return res.status(500).json({
      error: "Request failed",
      details: error.message
    });
  }
};
