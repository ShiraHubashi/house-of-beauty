const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'כמות חייבת להיות לפחות 1'],
    max: [100, 'כמות לא יכולה להיות יותר מ-100']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.sessionId;
    }
  },
  sessionId: {
    type: String,
    required: function() {
      return !this.userId;
    }
  },
  items: {
    type: [cartItemSchema],
    default: []
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Set expiration to 30 days from now
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Index for automatic deletion of expired carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for user lookup
cartSchema.index({ userId: 1 });
cartSchema.index({ sessionId: 1 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );
  
  if (existingItemIndex >= 0) {
    // Update quantity if item already exists
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      productId,
      quantity,
      addedAt: new Date()
    });
  }
  
  // Update expiration time
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const item = this.items.find(
    item => item.productId.toString() === productId.toString()
  );
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    this.items = this.items.filter(
      item => item.productId.toString() !== productId.toString()
    );
  } else {
    item.quantity = quantity;
    item.addedAt = new Date();
  }
  
  // Update expiration time
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.productId.toString() !== productId.toString()
  );
  
  // Update expiration time
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Method to get cart with populated product details
cartSchema.methods.getPopulatedCart = function() {
  return this.populate({
    path: 'items.productId',
    select: 'name price imageUrl inStock stockQuantity'
  });
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function(userId) {
  let cart = await this.findOne({ userId });
  
  if (!cart) {
    cart = new this({ userId });
    await cart.save();
  }
  
  return cart;
};

// Static method to find or create cart for session
cartSchema.statics.findOrCreateForSession = async function(sessionId) {
  let cart = await this.findOne({ sessionId });
  
  if (!cart) {
    cart = new this({ sessionId });
    await cart.save();
  }
  
  return cart;
};

// Method to transfer cart from session to user
cartSchema.statics.transferSessionCartToUser = async function(sessionId, userId) {
  const sessionCart = await this.findOne({ sessionId });
  if (!sessionCart || sessionCart.items.length === 0) {
    return null;
  }
  
  let userCart = await this.findOne({ userId });
  
  if (!userCart) {
    // Transfer session cart to user
    sessionCart.userId = userId;
    sessionCart.sessionId = undefined;
    return sessionCart.save();
  } else {
    // Merge session cart items into user cart
    for (const sessionItem of sessionCart.items) {
      await userCart.addItem(sessionItem.productId, sessionItem.quantity);
    }
    
    // Delete session cart
    await sessionCart.deleteOne();
    
    return userCart;
  }
};

module.exports = mongoose.model('Cart', cartSchema);