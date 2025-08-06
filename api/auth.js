export default async function handler(req, res) {
  const clientId = process.env.LIVECHAT_CLIENT_ID;
  const redirectUri = process.env.LIVECHAT_REDIRECT_URI;
  const scopes = 'reports_read agents--all:ro chats--all:ro';

  const authUrl = `https://accounts.livechat.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

  res.redirect(authUrl);
}
