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

    // Step 2: Call Reports API
    const reportResponse = await fetch("https://api.livechatinc.com/v3.5/reports/queues", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const reportData = await reportResponse.json();
    console.log("📊 Queue response:", reportData);

    const waiting = reportData?.queues?.[0]?.customers_waiting ?? 0;

    if (waiting >= 3) {
      console.log(`🚨 ALERT: ${waiting} customers are waiting in the queue.`);
    } else {
      console.log(`✅ Only ${waiting} customers waiting. All good.`);
    }

    return res.status(200).json({
      waiting,
      message: waiting >= 3 ? "Threshold exceeded" : "Queue size is OK"
    });
  } catch (error) {
    console.error("❌ Queue check failed:", error);
    return res.status(500).json({
      error: "Queue check failed",
      details: error.message
    });
  }
};
