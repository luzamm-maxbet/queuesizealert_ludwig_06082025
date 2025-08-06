export default async function handler(req, res) {
  // Use dynamic import to avoid ESM issues
  const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

  const accessToken = process.env.LIVECHAT_ACCESS_TOKEN;

  // Log the start and token snippet
  console.log("🔄 Starting queue check...");
  console.log("🔐 Using access token:", accessToken ? accessToken.slice(0, 20) + "..." : "None ❌");

  if (!accessToken) {
    return res.status(500).json({
      error: 'Queue check failed',
      details: 'No access token provided'
    });
  }

  try {
    // Call a known public LiveChat endpoint for testing
    const response = await fetch('https://api.livechatinc.com/v3.3/agents', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (!contentType.includes("application/json")) {
      console.error("❌ Non-JSON response:", text);
      throw new Error(`Non-JSON response: ${text}`);
    }

    const data = JSON.parse(text);

    console.log("✅ API call successful:", JSON.stringify(data, null, 2));

    return res.status(200).json({
      message: "Queue check succeeded",
      data
    });
  } catch (error) {
    console.error("❌ Queue check error:", error.message);
    return res.status(500).json({
      error: "Queue check failed",
      details: error.message
    });
  }
}
