const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  const clientId = process.env.LIVECHAT_CLIENT_ID;
  const clientSecret = process.env.LIVECHAT_CLIENT_SECRET;
  const licenseId = process.env.LIVECHAT_LICENSE_ID;
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  const threshold = parseInt(process.env.QUEUE_THRESHOLD || "3", 10);

  try {
    // Step 1: Get access token
    const tokenRes = await fetch("https://accounts.livechat.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenRes.json();
    console.log("🔐 Token response:", tokenData);

    if (!tokenData.access_token) {
      throw new Error("No access token received");
    }

    const accessToken = tokenData.access_token;

    // Step 2: Get queue info from chats summary
    const summaryRes = await fetch(`https://api.livechatinc.com/v3.5/chats/summary?license_id=${licenseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const raw = await summaryRes.text();
    console.log("📄 Raw response from chats/summary:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("❌ Failed to parse JSON:", e.message);
      return res.status(500).json({
        error: "API response not valid JSON",
        raw_response: raw
      });
    }

    const queued = data?.queued ?? 0;
    console.log(`👥 Currently queued: ${queued}`);

    // Step 3: Send to Teams if above threshold
    if (queued >= threshold && webhookUrl) {
      const message = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        summary: "LiveChat Queue Alert",
        themeColor: "FF0000",
        title: "🚨 LiveChat Queue Threshold Exceeded",
        text: `There are currently **${queued}** users in the queue. Threshold is ${threshold}.`
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      });

      console.log("✅ Teams alert sent.");
    }

    return res.status(200).json({
      queued,
      threshold,
      notified: queued >= threshold
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      error: "Queue check failed",
      details: error.message
    });
  }
};
