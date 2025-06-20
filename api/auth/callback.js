export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: "No code received" });
  }

  // Here: exchange code for token and fetch user info (to be implemented)
  return res.status(200).json({ success: true, codeReceived: code });
} 