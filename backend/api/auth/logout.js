export default function handler(req, res) {
  const frontendBase = process.env.FRONTEND_URL || 'https://foodieshub-gf03ozif6-aravind-pulluris-projects.vercel.app';
  
  res.setHeader(
    'Set-Cookie',
    'session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0'
  );
  
  res.redirect(frontendBase);
} 