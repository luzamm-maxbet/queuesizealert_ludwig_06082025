export default function handler(req, res) {
  const clientId = process.env.LIVECHAT_CLIENT_ID;
  const redirectUri = "https://queuesizealert-ludwig-06082025.vercel.app/callback";

  const authUrl = `https://accounts.livechat.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=reports_read`;

  res.redirect(authUrl);
}
