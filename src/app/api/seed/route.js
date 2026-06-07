/**
 * POST /api/seed
 * Seeds the database with an admin user and sample menu items.
 * Only works when no admin exists (prevents duplicate seeding).
 */
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
import MenuItem from '@/lib/models/MenuItem';

const SAMPLE_MENU_ITEMS = [
  // Coffee
  {
    name: 'Classic Espresso',
    description: 'Rich, bold single-shot espresso made from our signature dark roast beans.',
    price: 3.50,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400',
    isAvailable: true,
  },
  {
    name: 'Caramel Latte',
    description: 'Velvety steamed milk with a double shot of espresso and house-made caramel syrup.',
    price: 5.50,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    isAvailable: true,
  },
  {
    name: 'Iced Mocha',
    description: 'Chilled espresso blended with chocolate, milk, and topped with whipped cream.',
    price: 6.00,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400',
    isAvailable: true,
  },
  // Tea
  {
    name: 'Matcha Green Tea Latte',
    description: 'Premium Japanese matcha whisked with steamed oat milk and a touch of honey.',
    price: 5.00,
    category: 'tea',
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400',
    isAvailable: true,
  },
  {
    name: 'Chai Spice Tea',
    description: 'Warming blend of black tea, cinnamon, cardamom, ginger, and cloves.',
    price: 4.00,
    category: 'tea',
    image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400',
    isAvailable: true,
  },
  // Bakery
  {
    name: 'Butter Croissant',
    description: 'Flaky, golden French-style croissant made with imported butter. Baked fresh daily.',
    price: 3.50,
    category: 'bakery',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400',
    isAvailable: true,
  },
  {
    name: 'Blueberry Muffin',
    description: 'Soft, moist muffin packed with fresh blueberries and topped with a sugar crumble.',
    price: 4.00,
    category: 'bakery',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400',
    isAvailable: true,
  },
  // Sandwich
  {
    name: 'Grilled Panini',
    description: 'Toasted ciabatta with mozzarella, sun-dried tomatoes, pesto, and fresh basil.',
    price: 8.50,
    category: 'sandwich',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
    isAvailable: true,
  },
  {
    name: 'Avocado Toast',
    description: 'Sourdough toast topped with smashed avocado, cherry tomatoes, feta, and chili flakes.',
    price: 7.50,
    category: 'sandwich',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    isAvailable: true,
  },
  // Smoothie
  {
    name: 'Tropical Mango Smoothie',
    description: 'Fresh mango, pineapple, banana, and coconut milk blended to perfection.',
    price: 6.50,
    category: 'smoothie',
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
    isAvailable: true,
  },
  {
    name: 'Berry Blast Smoothie',
    description: 'Strawberries, blueberries, raspberries, Greek yogurt, and a drizzle of honey.',
    price: 6.50,
    category: 'smoothie',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    isAvailable: true,
  },
  // Dessert
  {
    name: 'New York Cheesecake',
    description: 'Creamy classic cheesecake on a graham cracker crust with berry compote.',
    price: 6.00,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=400',
    isAvailable: true,
  },
  {
    name: 'Chocolate Brownie',
    description: 'Dense, fudgy brownie with dark chocolate chunks, served warm with vanilla ice cream.',
    price: 5.50,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    isAvailable: true,
  },
];

export async function POST() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    let adminMessage = '';

    if (!existingAdmin) {
      await Admin.create({
        name: 'Café Admin',
        email: process.env.ADMIN_EMAIL || 'admin@brewandbite.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
      });
      adminMessage = 'Admin user created.';
    } else {
      adminMessage = 'Admin user already exists, skipped.';
    }

    // Seed menu items (only if DB is empty)
    const existingCount = await MenuItem.countDocuments();
    let menuMessage = '';

    if (existingCount === 0) {
      await MenuItem.insertMany(SAMPLE_MENU_ITEMS);
      menuMessage = `${SAMPLE_MENU_ITEMS.length} menu items seeded.`;
    } else {
      menuMessage = `${existingCount} menu items already exist, skipped.`;
    }

    return Response.json({
      success: true,
      message: 'Seed complete.',
      details: { admin: adminMessage, menu: menuMessage },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json(
      { success: false, message: 'Seed failed.', error: error.message },
      { status: 500 }
    );
  }
}
