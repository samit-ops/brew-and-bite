/**
 * GET /api/orders/[id]  — Fetch a single order by ID or orderNumber (public)
 * PUT /api/orders/[id]  — Update order status (admin only)
 */
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { authMiddleware } from '@/lib/auth';
import mongoose from 'mongoose';
import { sendNotification } from "@/lib/sendNotification";

// GET: Public — fetch single order
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    let order;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }

    if (!order) {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return Response.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: order });

  } catch (error) {
    console.error('GET /api/orders/[id] error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch order.' },
      { status: 500 }
    );
  }
}

// PUT: Admin — update order status + send notification
export async function PUT(request, { params }) {
  try {
    

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['received', 'preparing', 'out-for-delivery', 'delivered'];

    if (!status || !validStatuses.includes(status)) {
      return Response.json(
        { success: false, message: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    let order;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );
    }

    if (!order) {
      order = await Order.findOneAndUpdate(
        { orderNumber: id },
        { status },
        { new: true, runValidators: true }
      );
    }

    if (!order) {
      return Response.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }

    // 🔔 SEND NOTIFICATION TO USERS (THIS IS THE REAL FIX)
    const Token =
      mongoose.models.Token ||
      mongoose.model(
        "Token",
        new mongoose.Schema({
          token: String,
          role: String,
        })
      );

    const userTokensData = await Token.find({ role: "user" });
    const userTokens = userTokensData.map((t) => t.token);

    if (userTokens.length > 0) {
      await sendNotification(
        userTokens,
        "Order Update",
        `Your order #${order.orderNumber} is now ${status}`
      );
    } else {
      console.log("No user tokens found");
    }

    return Response.json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: order,
    });

  } catch (error) {
    console.error('PUT /api/orders/[id] error:', error);
    return Response.json(
      { success: false, message: 'Failed to update order.' },
      { status: 500 }
    );
  }
}