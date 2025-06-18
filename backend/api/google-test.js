export default function handler(req, res) {
  console.log('=== ROOT LEVEL GOOGLE TEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Timestamp:', new Date().toISOString());
  
  res.status(200).json({ 
    message: 'Root level Google test is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: '/api/google-test'
  });
} 