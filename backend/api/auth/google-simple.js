export default function handler(req, res) {
  console.log('=== SIMPLE GOOGLE TEST ENDPOINT ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  res.status(200).json({ 
    message: 'Simple Google test endpoint is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
} 