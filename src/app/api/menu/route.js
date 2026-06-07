/**
 * GET  /api/menu    — Fetch all menu items (with optional category filter)
 * POST /api/menu    — Create a new menu item (admin only)
 */
import dbConnect from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { authMiddleware } from '@/lib/auth';

// GET: Public — fetch menu items
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    // Build query
    const query = {};
    if (!includeDeleted) {
      query.isDeleted = false;
    }
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    const items = await MenuItem.find(query).sort({ category: 1, createdAt: -1 });

    return Response.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('GET /api/menu error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch menu items.' },
      { status: 500 }
    );
  }
}

// POST: Admin only — create a new menu item
export async function POST(request) {
  try {
    // Auth check
    const auth = await authMiddleware(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const body = await request.json();
    const { name, description, price, category, image, isAvailable } = body;

    // Validate required fields
    if (!name || !description || price === undefined || !category) {
      return Response.json(
        { success: false, message: 'name, description, price, and category are required.' },
        { status: 400 }
      );
    }

    const item = await MenuItem.create({
      name,
      description,
      price: Number(price),
      category: category.toLowerCase(),
      image: image || '',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    return Response.json(
      { success: true, message: 'Menu item created.', data: item },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/menu error:', error);

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return Response.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: 'Failed to create menu item.' },
      { status: 500 }
    );
  }
}
