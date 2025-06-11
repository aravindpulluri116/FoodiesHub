const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: "Mango Pickle",
    description: "Traditional raw mango pickle with aromatic spices. A perfect blend of tangy and spicy flavors.",
    price: 250,
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=400&q=80",
    category: "pickles"
  },
  {
    name: "Mixed Vegetable Pickle",
    description: "A delightful mix of seasonal vegetables pickled with our special spice blend.",
    price: 200,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&q=80",
    category: "pickles"
  },
  {
    name: "Lime Pickle",
    description: "Zesty lime pickle that adds a burst of flavor to any meal. Made with fresh limes and traditional spices.",
    price: 180,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=400&q=80",
    category: "pickles"
  },
  {
    name: "Chicken Biryani",
    description: "Aromatic basmati rice layered with tender chicken pieces and traditional spices.",
    price: 350,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=400&q=80",
    category: "biryanis"
  },
  {
    name: "Mutton Biryani",
    description: "Rich and flavorful mutton biryani with perfectly cooked rice and succulent meat.",
    price: 450,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=400&q=80",
    category: "biryanis"
  },
  {
    name: "Veg Biryani",
    description: "Fragrant vegetable biryani with seasonal vegetables and aromatic spices.",
    price: 280,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=400&q=80",
    category: "biryanis"
  },
  {
    name: "Butter Chicken",
    description: "Creamy and rich butter chicken curry made with tender chicken pieces.",
    price: 320,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
    category: "non-veg"
  },
  {
    name: "Paneer Butter Masala",
    description: "Creamy tomato-based curry with soft paneer cubes in rich gravy.",
    price: 280,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80",
    category: "veg"
  },
  {
    name: "Dal Tadka",
    description: "Traditional yellow lentil curry tempered with aromatic spices.",
    price: 180,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
    category: "veg"
  },
  {
    name: "Fish Curry",
    description: "Authentic fish curry with coconut milk and traditional coastal spices.",
    price: 380,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80",
    category: "non-veg"
  },
  {
    name: "Special Thali",
    description: "Complete meal with rice, dal, vegetables, curry, pickle, and dessert.",
    price: 450,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80",
    category: "specials"
  },
  {
    name: "Family Combo",
    description: "Perfect for 4 people - includes biryani, curry, dal, and pickles.",
    price: 1200,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80",
    category: "specials"
  },
  {
    name: "Green Chilli Pickle",
    description: "Spicy green chilli pickle with a perfect balance of heat and flavor.",
    price: 220,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=400&q=80",
    category: "pickles"
  },
  {
    name: "Garlic Pickle",
    description: "Aromatic garlic pickle with a strong, pungent flavor that enhances any meal.",
    price: 280,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=400&q=80",
    category: "pickles"
  },
  {
    name: "Veg Pulao",
    description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices.",
    price: 250,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=400&q=80",
    category: "biryanis"
  }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      // Clear existing products
      await Product.deleteMany({});
      console.log('Cleared existing products');

      // Insert new products
      const insertedProducts = await Product.insertMany(products);
      console.log('Inserted products:', insertedProducts.length);
      process.exit(0);
    } catch (error) {
      console.error('Error seeding products:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 