const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: "Mango Pickle",
    description: "Traditional raw mango pickle with aromatic spices. A perfect blend of tangy and spicy flavors.",
    price: 250,
    image: "https://images.unsplash.com/photo-1664791461482-79f5deee490f?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "pickles"
  },
  {
    name: "Mixed Vegetable Pickle",
    description: "A delightful mix of seasonal vegetables pickled with our special spice blend. Made with fresh, crunchy vegetables like cauliflower, raw mango, carrot, and more, seasoned with traditional spices.",
    price: 200,
    image: "/mixed veg pickle.png",
    category: "pickles"
  },
  {
    name: "Lime Pickle",
    description: "Zesty lime pickle that adds a burst of flavor to any meal. Made with fresh limes and traditional spices.",
    price: 180,
    image: "https://chefsmandala.com/wp-content/uploads/2018/04/Indian-Lemon-Pickle.jpg",
    category: "pickles"
  },
  {
    name: "Chicken Biryani",
    description: "Aromatic basmati rice layered with tender chicken pieces and traditional spices.",
    price: 350,
    image: "https://www.licious.in/blog/wp-content/uploads/2022/06/chicken-hyderabadi-biryani-01-750x750.jpg",
    category: "biryanis"
  },
  {
    name: "Mutton Biryani",
    description: "Rich and flavorful mutton biryani with perfectly cooked rice and succulent meat.",
    price: 450,
    image: "https://crunchymunchie.in/wp-content/uploads/2024/05/biryani03.jpg",
    category: "biryanis"
  },
  {
    name: "Veg Biryani",
    description: "Fragrant vegetable biryani with seasonal vegetables and aromatic spices.",
    price: 280,
    image: "https://www.madhuseverydayindian.com/wp-content/uploads/2022/11/easy-vegetable-biryani.jpg",
    category: "biryanis"
  },
  {
    name: "Butter Chicken",
    description: "Creamy and rich butter chicken curry made with tender chicken pieces.",
    price: 320,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    category: "non-veg"
  },
  {
    name: "Paneer Butter Masala",
    description: "Creamy tomato-based curry with soft paneer cubes in rich gravy.",
    price: 280,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    category: "veg"
  },
  {
    name: "Dal Tadka",
    description: "Traditional yellow lentil curry tempered with aromatic spices.",
    price: 180,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    category: "veg"
  },
  {
    name: "Fish Curry",
    description: "Authentic fish curry with coconut milk and traditional coastal spices.",
    price: 380,
    image: "https://i.ytimg.com/vi/ZqkcrV326WY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAip-TOl9jJKv0sUy71i5wku8GFqQ",
    category: "non-veg"
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