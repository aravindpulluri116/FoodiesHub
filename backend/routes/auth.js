const express = require('express');
const passport = require('passport');
const router = express.Router();

// Get current user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
      isAdmin: req.user.isAdmin
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.redirect(process.env.FRONTEND_URL);
  });
});

module.exports = router; 