const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Example product to add
const newProduct = {
  name: "Chicken Curry",
  description: "Traditional chicken curry with rich, spicy gravy and tender chicken pieces.",
  price: 320,
  image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
  category: "non-veg"
};

// Connect to MongoDB and add the product
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(async () => {
    try {
      const product = new Product(newProduct);
      const savedProduct = await product.save();
      console.log('Product added successfully:', savedProduct);
      process.exit(0);
    } catch (error) {
      console.error('Error adding product:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 