import dbConnect from '../../../../db.js';
import User from '../../../../models/User.js';

export default async function handler(req, res) {
  const { code } = req.query;
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const backendBase  = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://foodieshubbackend.vercel.app';
  const frontendBase = process.env.FRONTEND_URL || 'https://foodieshub-gf03ozif6-aravind-pulluris-projects.vercel.app';

  if (!code) {
    return res.redirect(`${frontendBase}?error=no_code`);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${backendBase}/api/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect(`${frontendBase}?error=token_failed`);
    }

    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const profile = await profileRes.json();
    if (!profile.id) {
      return res.redirect(`${frontendBase}?error=user_failed`);
    }

    await dbConnect();
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name:     profile.name,
        email:    profile.email,
        picture:  profile.picture
      });
    }

    const sessionToken = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');
    res.setHeader('Set-Cookie',
      `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=None`
    );

    res.redirect(`${frontendBase}?success=true`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${frontendBase}?error=server_error`);
  }
} 