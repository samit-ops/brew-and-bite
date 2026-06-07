/**
 * GET  /api/orders  — Fetch all orders (admin only)
 * POST /api/orders  — Create a new order (customer checkout)
 */

import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';
import { authMiddleware } from '@/lib/auth';
import { sendNotification } from "@/lib/sendNotification";
import mongoose from "mongoose";


// GET: Admin only — list all orders
export async function GET(request) {
  try {
    const auth = await authMiddleware(request);
    if (auth.error) return auth.error;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return Response.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}


// POST: Create order
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { customer, items } = body;

    // Validate customer
    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return Response.json(
        { success: false, message: 'Customer name, phone, and address are required.' },
        { status: 400 }
      );
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json(
        { success: false, message: 'At least one item is required.' },
        { status: 400 }
      );
    }

    // Fetch menu items
    const menuItemIds = items.map((i) => i.menuItem);
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      isDeleted: false,
      isAvailable: true,
    });

    if (menuItems.length !== items.length) {
      return Response.json(
        { success: false, message: 'One or more items are unavailable.' },
        { status: 400 }
      );
    }

    // Map items
    const menuItemMap = {};
    menuItems.forEach((mi) => {
      menuItemMap[mi._id.toString()] = mi;
    });

    let totalAmount = 0;

    const orderItems = items.map((cartItem) => {
      const dbItem = menuItemMap[cartItem.menuItem];
      const qty = Math.max(1, Math.floor(Number(cartItem.quantity) || 1));

      totalAmount += dbItem.price * qty;

      return {
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: qty,
        image: dbItem.image || '',
      };
    });

    totalAmount = Math.round(totalAmount * 100) / 100;

    // Create order
    const order = await Order.create({
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      items: orderItems,
      totalAmount,
      status: 'received',
    });

    // 🔥 TOKEN MODEL (SAFE)
    const Token =
      mongoose.models.Token ||
      mongoose.model(
        "Token",
        new mongoose.Schema({
          token: String,
          role: String,
        })
      );

    // 🔍 DEBUG (you can remove later)
    const allTokens = await Token.find({});

    // 🎯 GET ADMIN TOKENS
    const adminTokensData = await Token.find({ role: "admin" });

    const adminTokens = adminTokensData.map((t) => t.token);

    // 🔔 SEND NOTIFICATION (SAFE)
    if (adminTokens.length > 0) {
      await sendNotification(
        adminTokens,
        "New Order Received",
        `Order #${order.orderNumber} placed`
      );
    } else {
      console.log("No admin tokens found");
    }

    return Response.json(
      {
        success: true,
        message: 'Order placed successfully!',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/orders error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return Response.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: 'Failed to create order.' },
      { status: 500 }
    );
  }
}