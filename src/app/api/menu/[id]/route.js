/**
 * GET    /api/menu/[id]  — Fetch a single menu item
 * PUT    /api/menu/[id]  — Update a menu item (admin only) — also handles restore
 * DELETE /api/menu/[id]  — Soft delete a menu item (admin only)
 */
import dbConnect from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { authMiddleware } from '@/lib/auth';

// GET: Public — fetch one item by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const item = await MenuItem.findById(id);
    if (!item) {
      return Response.json(
        { success: false, message: 'Menu item not found.' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: item });
  } catch (error) {
    console.error('GET /api/menu/[id] error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch menu item.' },
      { status: 500 }
    );
  }
}

// PUT: Admin only — update a menu item (or restore if isDeleted: false is sent)
export async function PUT(request, { params }) {
  try {
    const auth = await authMiddleware(request);
    if (auth.error) return auth.error;

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Build update object from allowed fields
    const allowedFields = ['name', 'description', 'price', 'category', 'image', 'isAvailable', 'isDeleted'];
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    if (update.price !== undefined) update.price = Number(update.price);
    if (update.category) update.category = update.category.toLowerCase();

    const item = await MenuItem.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return Response.json(
        { success: false, message: 'Menu item not found.' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Menu item updated.',
      data: item,
    });
  } catch (error) {
    console.error('PUT /api/menu/[id] error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return Response.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: 'Failed to update menu item.' },
      { status: 500 }
    );
  }
}

// DELETE: Admin only — soft delete (sets isDeleted: true)
export async function DELETE(request, { params }) {
  try {
    const auth = await authMiddleware(request);
    if (auth.error) return auth.error;

    await dbConnect();
    const { id } = await params;

    const item = await MenuItem.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!item) {
      return Response.json(
        { success: false, message: 'Menu item not found.' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Menu item soft-deleted.',
      data: item,
    });
  } catch (error) {
    console.error('DELETE /api/menu/[id] error:', error);
    return Response.json(
      { success: false, message: 'Failed to delete menu item.' },
      { status: 500 }
    );
  }
}
