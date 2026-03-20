const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

dotenv.config();

const sampleProducts = [
  {
    name: 'Fresh Spinach',
    description: 'Tender, dark green spinach leaves. Rich in iron, vitamins A, C and K. Perfect for salads, smoothies, and stir-fries.',
    price: 25,
    originalPrice: 30,
    category: 'Leafy Greens',
    unit: 'bunch',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
    isFeatured: true,
    discount: 17,
    tags: ['leafy', 'iron-rich', 'healthy'],
    nutritionInfo: { calories: 23, protein: '2.9g', carbs: '3.6g', fiber: '2.2g' },
  },
  {
    name: 'Organic Tomatoes',
    description: 'Vine-ripened organic tomatoes with a rich, sweet flavor. Perfect for salads, curries, and sauces.',
    price: 40,
    originalPrice: 50,
    category: 'Others',
    unit: 'kg',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
    isFeatured: true,
    discount: 20,
    tags: ['organic', 'lycopene', 'vitamin-c'],
    nutritionInfo: { calories: 18, protein: '0.9g', carbs: '3.9g', fiber: '1.2g' },
  },
  {
    name: 'Baby Potatoes',
    description: 'Small, creamy baby potatoes perfect for roasting. They cook faster and have a buttery texture.',
    price: 35,
    originalPrice: 40,
    category: 'Root Vegetables',
    unit: 'kg',
    stock: 120,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    isFeatured: false,
    discount: 12,
    tags: ['starchy', 'roasting', 'versatile'],
  },
  {
    name: 'Bitter Gourd (Karela)',
    description: 'Fresh bitter gourd known for its medicinal properties. Excellent for blood sugar management.',
    price: 30,
    category: 'Gourds',
    unit: 'kg',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1630395822370-0c41e5b0d75c?w=400',
    isFeatured: false,
    tags: ['medicinal', 'diabetic-friendly', 'bitter'],
  },
  {
    name: 'Purple Cabbage',
    description: 'Vibrant purple cabbage packed with antioxidants. Great for slaws, salads, and stir-fries.',
    price: 45,
    originalPrice: 55,
    category: 'Leafy Greens',
    unit: 'piece',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
    isFeatured: true,
    discount: 18,
    tags: ['antioxidant', 'colorful', 'crunchy'],
  },
  {
    name: 'Fresh Carrots',
    description: 'Crunchy, sweet carrots grown locally. Rich in beta-carotene and vitamin A. Great raw or cooked.',
    price: 30,
    category: 'Root Vegetables',
    unit: 'kg',
    stock: 90,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
    isFeatured: false,
    tags: ['beta-carotene', 'crunchy', 'sweet'],
    nutritionInfo: { calories: 41, protein: '0.9g', carbs: '10g', fiber: '2.8g' },
  },
  {
    name: 'Broccoli',
    description: 'Fresh green broccoli florets. Superfood packed with vitamin C, K and fiber. Steam, roast or stir-fry.',
    price: 60,
    originalPrice: 75,
    category: 'Exotic Vegetables',
    unit: 'piece',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400',
    isFeatured: true,
    discount: 20,
    tags: ['superfood', 'vitamin-c', 'exotic'],
    nutritionInfo: { calories: 34, protein: '2.8g', carbs: '7g', fiber: '2.6g' },
  },
  {
    name: 'Green Peas (Matar)',
    description: 'Fresh shelled green peas, sweet and tender. Perfect for curries, rice dishes, and snacking.',
    price: 50,
    category: 'Others',
    unit: 'kg',
    stock: 70,
    image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400',
    isFeatured: false,
    tags: ['protein', 'sweet', 'seasonal'],
  },
  {
    name: 'Bottle Gourd (Lauki)',
    description: 'Fresh bottle gourd, light and easily digestible. Excellent for weight management and cooling in summer.',
    price: 20,
    category: 'Gourds',
    unit: 'piece',
    stock: 55,
    image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400',
    isFeatured: false,
    tags: ['light', 'digestive', 'cooling'],
  },
  {
    name: 'Fresh Coriander',
    description: 'Aromatic fresh coriander leaves. An essential herb in Indian cooking. Adds fragrance and flavor.',
    price: 15,
    category: 'Herbs & Spices',
    unit: 'bunch',
    stock: 200,
    image: 'https://images.unsplash.com/photo-1589566777565-3b33f89b93af?w=400',
    isFeatured: false,
    tags: ['aromatic', 'herb', 'garnish'],
  },
  {
    name: 'Capsicum Mix (Bell Pepper)',
    description: 'Colorful mix of red, yellow and green capsicum. Sweet, crunchy and loaded with vitamin C.',
    price: 80,
    originalPrice: 100,
    category: 'Exotic Vegetables',
    unit: 'kg',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
    isFeatured: true,
    discount: 20,
    tags: ['colorful', 'vitamin-c', 'crunchy'],
  },
  {
    name: 'Onions',
    description: 'Fresh red onions, a staple in every kitchen. Essential for curries, salads, and chutneys.',
    price: 25,
    category: 'Root Vegetables',
    unit: 'kg',
    stock: 200,
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400',
    isFeatured: false,
    tags: ['staple', 'pungent', 'versatile'],
  },
];

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected for seeding');
};

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Smart Sabji Admin',
      email: process.env.ADMIN_EMAIL || 'admin@smartsabji.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      phone: '9999999999',
    });
    console.log(`👤 Admin created: ${admin.email}`);

    // Create sample user
    const user = await User.create({
      name: 'Test User',
      email: 'user@smartsabji.com',
      password: 'User@123',
      role: 'user',
      phone: '9876543210',
      address: {
        street: '123 Garden Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
    });
    await Cart.create({ user: user._id, items: [] });
    console.log(`👤 Test user created: ${user.email}`);

    // Create products
    const products = await Product.insertMany(sampleProducts);
    console.log(`🥦 ${products.length} products seeded`);

    console.log('\n✅ Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log(`Admin Email   : ${admin.email}`);
    console.log(`Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log(`User Email    : user@smartsabji.com`);
    console.log(`User Password : User@123`);
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
