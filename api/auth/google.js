export default async function handler(req, res) {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const redirect_uri = encodeURIComponent("https://foodieshubbackend.vercel.app/api/auth/google/callback");
  const scope = encodeURIComponent("openid email profile");

  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;

  return res.redirect(302, url);
} 