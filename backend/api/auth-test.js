export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://foodieshub-two.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple path parsing
  const urlNoQuery = req.url.split('?')[0];
  const segments = urlNoQuery.split('/').filter(Boolean);
  const route = segments[0] ? `/${segments[0]}` : '/';

  console.log('AUTH-TEST DEBUG:', {
    reqUrl: req.url,
    urlNoQuery,
    segments,
    route,
    method: req.method
  });

  // Test endpoint
  if (route === '/google' && req.method === 'GET') {
    res.status(200).json({
      message: 'Google OAuth test endpoint is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      route: route
    });
    return;
  }

  // Default response
  res.status(200).json({
    message: 'Auth test endpoint is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    route: route
  });
} 