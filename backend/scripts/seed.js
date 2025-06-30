const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample products data
const productsData = [
  {
    name: "אגרטל קרמיקה מינימליסטי",
    description: "אגרטל קרמיקה אלגנטי בעיצוב מינימליסטי מודרני. מושלם לכל חלל בית ויתאים לכל סוג של פרחים או צמחים. העיצוב הנקי והאלגנטי יוסיף נופך מיוחד לבית שלכם.",
    price: 189,
    imageUrl: "http://localhost:5173/images/product1.png",
    imagePublicId: "beauty-store/products/vase_ceramic_1",
    category: "כלי בית",
    inStock: true,
    stockQuantity: 25,
    featured: true
  },
  {
    name: "זוג פמוטים עתיקים",
    description: "זוג פמוטים מרהיבים בסגנון עתיק עם גימור מתכתי מיוחד. מעוצבים בקפידה עם תשומת לב לפרטים הקטנים. יוצרים אווירה רומנטית ומיוחדת בכל חלל.",
    price: 245,
    imageUrl: "http://localhost:5173/images/product2.png",
    imagePublicId: "beauty-store/products/candle_holders_1",
    category: "תאורה",
    inStock: true,
    stockQuantity: 15,
    featured: true
  },
  {
    name: "כרית נוי מעוצבת",
    description: "כרית נוי רכה ומעוצבת במיוחד לסלון. עשויה מחומרים איכותיים ועמידים. העיצוב המודרני והצבעים החמים יתאימו לכל סגנון בית ויוסיפו נוחות ויופי.",
    price: 129,
    imageUrl: "http://localhost:5173/images/product3.png",
    imagePublicId: "beauty-store/products/decorative_pillow_1",
    category: "טקסטיל",
    inStock: true,
    stockQuantity: 30,
    featured: true
  },
  {
    name: "מנורת שולחן מעוצבת",
    description: "מנורת שולחן אלגנטית עם אהיל מיוחד. מספקת תאורה נעימה ומזמינה לכל חלל. העיצוב המתוחכם והגימור המשובח הופכים אותה לפריט דקורטיבי מושלם.",
    price: 320,
    imageUrl: "http://localhost:5173/images/product4.png",
    imagePublicId: "beauty-store/products/table_lamp_1",
    category: "תאורה",
    inStock: true,
    stockQuantity: 12,
    featured: true
  },
  {
    name: "נר ארומתי יוקרתי",
    description: "נר ארומתי איכותי עם ריח מרגיע ומיוחד. עשוי משעווה טבעית וצבעי מאכל. הריח המופלא והזמן הבעירה הארוך הופכים אותו למושלם לערבי רומנטיקה או רגיעה.",
    price: 85,
    imageUrl: "http://localhost:5173/images/product5.png",
    imagePublicId: "beauty-store/products/aromatic_candle_1",
    category: "ריחות",
    inStock: true,
    stockQuantity: 40,
    featured: true
  },
  {
    name: "עציץ פיקוס נוי",
    description: "עציץ פיקוס טבעי מושלם לקישוט הבית. צמח מטהר אוויר שקל לטיפוח ומתאים לכל רמת ניסיון. מגיע בעציץ מעוצב שמתאים לכל חלל בבית.",
    price: 165,
    imageUrl: "http://localhost:5173/images/product6.png",
    imagePublicId: "beauty-store/products/ficus_plant_1",
    category: "צמחים",
    inStock: true,
    stockQuantity: 20,
    featured: true
  },
  {
    name: "שטיח בוהמייני צבעוני",
    description: "שטיח בוהמייני מרהיב בצבעים חמים ומזמינים. עשוי מחומרים איכותיים ועמידים. התבנית הייחודית והצבעים העשירים יהפכו כל חלל לחם ומקסים.",
    price: 450,
    imageUrl: "http://localhost:5173/images/product7.png",
    imagePublicId: "beauty-store/products/bohemian_rug_1",
    category: "שטיחים",
    inStock: true,
    stockQuantity: 8,
    featured: true
  },
  {
    name: "שעון קיר מודרני",
    description: "שעון קיר בעיצוב מודרני ונקי. עשוי מחומרים איכותיים עם מנגנון שקט. העיצוב המינימליסטי והאלגנטי יתאים לכל סגנון בית ויהווה נקודת מוקד מעניינת על הקיר.",
    price: 275,
    imageUrl: "http://localhost:5173/images/product8.png",
    imagePublicId: "beauty-store/products/wall_clock_1",
    category: "אקססוריז",
    inStock: true,
    stockQuantity: 18,
    featured: true
  },
  {
    name: "תמונת קיר אמנותית",
    description: "תמונת קיר אמנותית מקורית במסגרת איכותית. יצירה ייחודית שתוסיף אופי ואלגנטיות לכל חלל. הצבעים והעיצוב המתוחכם יהפכו כל קיר לגלריה אמנותית.",
    price: 390,
    imageUrl: "http://localhost:5173/images/product9.png",
    imagePublicId: "beauty-store/products/art_painting_1",
    category: "אמנות",
    inStock: true,
    stockQuantity: 10,
    featured: true
  },
  // Additional non-featured products
  {
    name: "מראה עגולה מעוצבת",
    description: "מראה עגולה יפהפייה עם מסגרת מעוצבת. תוסיף תחושת מרחב ואור לכל חלל בבית.",
    price: 220,
    imageUrl: "http://localhost:5173/images/product11.png",
    imagePublicId: "beauty-store/products/round_mirror_1",
    category: "אקססוריז",
    inStock: true,
    stockQuantity: 15,
    featured: false
  },
  {
    name: "סלסלת אחסון קש",
    description: "סלסלת אחסון יפהפייה עשויה קש טבעי. מושלמת לאחסון כביסה, צעצועים או אביזרים.",
    price: 95,
    imageUrl: "http://localhost:5173/images/product10.png",
    imagePublicId: "beauty-store/products/wicker_basket_1",
    category: "כלי בית",
    inStock: true,
    stockQuantity: 22,
    featured: false
  },
  {
    name: "גביע זכוכית אמנותי",
    description: "גביע זכוכית יפהפה בעבודת יד. מושלם לפרחים או כפריט דקורטיבי עצמאי.",
    price: 150,
    imageUrl: "http://localhost:5173/images/product12.png",
    imagePublicId: "beauty-store/products/glass_vase_1",
    category: "כלי בית",
    inStock: true,
    stockQuantity: 18,
    featured: false
  }
];

// Sample admin user
const adminUserData = {
  firstName: "מנהל",
  lastName: "המערכת",
  email: "admin@beautystore.com",
  password: "admin123456",
  phone: "0501234567",
  role: "admin",
  address: {
    street: "רחוב הראשי 1",
    city: "תל אביב",
    zipCode: "12345",
    country: "ישראל"
  }
};

// Sample customer user
const customerUserData = {
  firstName: "לקוח",
  lastName: "לדוגמה",
  email: "customer@example.com",
  password: "customer123",
  phone: "0507654321",
  role: "customer",
  address: {
    street: "רחוב הלקוחות 10",
    city: "פתח תקווה",
    zipCode: "54321",
    country: "ישראל"
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create products
    console.log('📦 Creating products...');
    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User(adminUserData);
    await adminUser.save();
    console.log(`✅ Created admin user: ${adminUser.email}`);

    // Create customer user
    console.log('👤 Creating customer user...');
    const customerUser = new User(customerUserData);
    await customerUser.save();
    console.log(`✅ Created customer user: ${customerUser.email}`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log(`Admin: ${adminUserData.email} / ${adminUserData.password}`);
    console.log(`Customer: ${customerUserData.email} / ${customerUserData.password}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase, connectDB };