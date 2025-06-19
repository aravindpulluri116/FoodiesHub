import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  picture: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  cart: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Add index for googleId for better query performance
userSchema.index({ googleId: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User; 