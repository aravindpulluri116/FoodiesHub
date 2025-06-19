export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://foodieshubbackend.vercel.app'}/api/auth/google/callback`;

  if (!clientId) {
    return res.status(500).json({ error: 'Missing GOOGLE_CLIENT_ID' });
  }

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&access_type=offline`;

  res.writeHead(302, { Location: googleAuthUrl });
  res.end();
} 