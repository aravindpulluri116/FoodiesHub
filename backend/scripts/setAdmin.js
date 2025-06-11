const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function setAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOneAndUpdate(
      { googleId: '104927229165142059847' },
      { isAdmin: true },
      { new: true }
    );

    if (adminUser) {
      console.log('Admin user updated successfully:', adminUser);
    } else {
      console.log('Admin user not found');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setAdmin(); 