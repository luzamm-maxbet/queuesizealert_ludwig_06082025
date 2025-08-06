export default async function handler(req, res) {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = encodeURIComponent("https://YOUR-VERCEL-URL.vercel.app/api/callback");
  const scope = encodeURIComponent("reports_read chats--all:ro agents--all:ro");
  const state = "maxbet-queue-alert"; // Optional: can randomize for CSRF protection

  const authUrl = `https://accounts.livechat.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

  res.redirect(authUrl);
}

