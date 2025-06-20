export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent("https://foodieshubbackend.vercel.app/api/auth/google/callback");
  const scope = encodeURIComponent("openid email profile");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  res.redirect(302, authUrl);
} 