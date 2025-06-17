const express = require('express');
const passport = require('passport');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:8080');
  }
);

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  res.json(req.user);
});

// Update user phone number
router.post('/update-phone', isAuthenticated, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { phone },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ message: 'Error updating phone number' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router; 