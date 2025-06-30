const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'שם המוצר נדרש'],
    trim: true,
    maxlength: [100, 'שם המוצר לא יכול להיות ארוך מ-100 תווים']
  },
  description: {
    type: String,
    required: [true, 'תיאור המוצר נדרש'],
    maxlength: [1000, 'תיאור המוצר לא יכול להיות ארוך מ-1000 תווים']
  },
  price: {
    type: Number,
    required: [true, 'מחיר המוצר נדרש'],
    min: [0, 'מחיר המוצר לא יכול להיות שלילי']
  },
  imageUrl: {
    type: String,
    required: [true, 'קישור לתמונה נדרש']
  },
  imagePublicId: {
    type: String,
    required: [true, 'מזהה התמונה בCloudinary נדרש']
  },
  category: {
    type: String,
    required: [true, 'קטגוריה נדרשת'],
    enum: {
      values: ['כלי בית', 'תאורה', 'טקסטיל', 'ריחות', 'צמחים', 'שטיחים', 'אקססוריז', 'אמנות'],
      message: 'קטגוריה לא חוקית'
    }
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    required: [true, 'כמות במלאי נדרשת'],
    min: [0, 'כמות במלאי לא יכולה להיות שלילית'],
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ inStock: 1 });

// Virtual for checking if product is available
productSchema.virtual('isAvailable').get(function() {
  return this.inStock && this.stockQuantity > 0;
});

// Method to decrease stock when ordered
productSchema.methods.decreaseStock = function(quantity) {
  if (this.stockQuantity >= quantity) {
    this.stockQuantity -= quantity;
    if (this.stockQuantity === 0) {
      this.inStock = false;
    }
    return this.save();
  } else {
    throw new Error('Not enough stock available');
  }
};

// Method to increase stock when order is cancelled
productSchema.methods.increaseStock = function(quantity) {
  this.stockQuantity += quantity;
  this.inStock = true;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);