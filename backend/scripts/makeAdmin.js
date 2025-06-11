const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const userEmail = 'pulluriaravind@gmail.com';
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('User not found');
      return;
    }

    user.isAdmin = true;
    await user.save();
    console.log('User is now an admin');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin(); 