/**
 * MenuItem Model
 * Represents a café menu item with soft-delete support.
 */
import mongoose from 'mongoose';

const CATEGORIES = ['coffee', 'tea', 'bakery', 'sandwich', 'smoothie', 'dessert'];

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      },
      lowercase: true,
    },
    image: {
      type: String,
      default: '', // URL to product image
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete flag
    },
  },
  { timestamps: true }
);

// Compound index for fast filtered queries
MenuItemSchema.index({ category: 1, isDeleted: 1 });
MenuItemSchema.index({ isDeleted: 1, isAvailable: 1 });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
