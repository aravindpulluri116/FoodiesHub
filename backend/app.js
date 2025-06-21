require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

const allowedOrigins = [
  'https://foodieshub-two.vercel.app', // Production frontend
  process.env.FRONTEND_URL, // From env
  'http://localhost:5173', // Local dev
  'http://localhost:3000',
  'http://localhost:8080',
].filter(Boolean);

// Trust the first proxy
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some(allowedOrigin => {
        // Handle regex in allowedOrigins
        if (allowedOrigin.startsWith('regex:')) {
          const regex = new RegExp(allowedOrigin.substring(6));
          return regex.test(origin);
        }
        return origin === allowedOrigin;
      });

      if (isAllowed || (process.env.NODE_ENV !== 'production' && origin.endsWith('.vercel.app'))) {
        return callback(null, true);
      }

      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    },
  })
);

// Passport middleware
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app; 
