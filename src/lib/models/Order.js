/**
 * Order Model
 * Tracks customer orders with items, status, and auto-generated order number.
 */
import mongoose from 'mongoose';

const ORDER_STATUSES = ['received', 'preparing', 'out-for-delivery', 'delivered'];

// Sub-schema for order items (snapshot of menu item at time of order)
const OrderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Delivery address is required'],
        trim: true,
      },
    },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: `Status must be one of: ${ORDER_STATUSES.join(', ')}`,
      },
      default: 'received',
    },
  },
  { timestamps: true }
);

// Index for fast queries
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Auto-generate order number before saving
OrderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.models.Order.countDocuments();
    this.orderNumber = `BB-${String(count + 1001).padStart(5, '0')}`;
  }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
