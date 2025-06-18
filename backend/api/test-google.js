export default function handler(req, res) {
  console.log('=== TEST GOOGLE ENDPOINT ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Timestamp:', new Date().toISOString());
  
  res.status(200).json({ 
    message: 'Test Google endpoint is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: '/api/test-google'
  });
} 