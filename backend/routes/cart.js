const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { optionalAuth, generateSessionId } = require('../middleware/auth');
const { validateCartItem } = require('../middleware/validation');

// Helper function to get or create cart
const getOrCreateCart = async (req) => {
  if (req.user) {
    // Authenticated user
    return await Cart.findOrCreateForUser(req.user._id);
  } else {
    // Anonymous user - use session ID from header or create new one
    let sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      sessionId = generateSessionId();
    }
    return await Cart.findOrCreateForSession(sessionId);
  }
};

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Public (with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    await cart.getPopulatedCart();

    // Filter out products that no longer exist or are out of stock
    const validItems = cart.items.filter(item => 
      item.productId && item.productId.inStock
    );

    // Update cart if any items were removed
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Calculate totals
    const cartSummary = {
      items: cart.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        quantity: item.quantity,
        subtotal: item.productId.price * item.quantity,
        inStock: item.productId.inStock,
        stockQuantity: item.productId.stockQuantity
      })),
      totalItems: cart.totalItems,
      totalAmount: cart.items.reduce((total, item) => 
        total + (item.productId.price * item.quantity), 0
      ),
      sessionId: cart.sessionId || null
    };

    res.json({
      success: true,
      data: cartSummary
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת עגלת הקניות'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Public (with optional auth)
router.post('/add', optionalAuth, validateCartItem, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'מוצר לא נמצא'
      });
    }

    if (!product.inStock || product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'מוצר לא זמין במלאי'
      });
    }

    const cart = await getOrCreateCart(req);
    
    // Check if adding this quantity exceeds stock
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );
    
    const totalQuantity = (existingItem ? existingItem.quantity : 0) + quantity;
    
    if (totalQuantity > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `רק ${product.stockQuantity} יחידות זמינות במלאי`
      });
    }

    await cart.addItem(productId, quantity);
    await cart.getPopulatedCart();

    res.json({
      success: true,
      data: {
        message: 'מוצר נוסף לעגלה בהצלחה',
        totalItems: cart.totalItems,
        sessionId: cart.sessionId || null
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהוספת מוצר לעגלה'
    });
  }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Public (with optional auth)
router.put('/update', optionalAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'מזהה מוצר וכמות נדרשים'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'כמות לא יכולה להיות שלילית'
      });
    }

    const cart = await getOrCreateCart(req);

    // If quantity is 0, remove item
    if (quantity === 0) {
      await cart.removeItem(productId);
    } else {
      // Check product availability
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'מוצר לא נמצא'
        });
      }

      if (!product.inStock || product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `רק ${product.stockQuantity} יחידות זמינות במלאי`
        });
      }

      await cart.updateItemQuantity(productId, quantity);
    }

    await cart.getPopulatedCart();

    res.json({
      success: true,
      data: {
        message: 'עגלת הקניות עודכנה בהצלחה',
        totalItems: cart.totalItems
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        message: 'מוצר לא נמצא בעגלה'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון עגלת הקניות'
    });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Public (with optional auth)
router.delete('/remove/:productId', optionalAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await getOrCreateCart(req);
    await cart.removeItem(productId);

    res.json({
      success: true,
      data: {
        message: 'מוצר הוסר מהעגלה בהצלחה',
        totalItems: cart.totalItems
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהסרת מוצר מהעגלה'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Public (with optional auth)
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    await cart.clearCart();

    res.json({
      success: true,
      message: 'עגלת הקניות רוקנה בהצלחה'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בריקון עגלת הקניות'
    });
  }
});

// @route   POST /api/cart/merge
// @desc    Merge session cart with user cart after login
// @access  Private
router.post('/merge', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'התחברות נדרשת'
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'מזהה מושב נדרש'
      });
    }

    const mergedCart = await Cart.transferSessionCartToUser(sessionId, req.user._id);

    if (mergedCart) {
      await mergedCart.getPopulatedCart();
      
      res.json({
        success: true,
        data: {
          message: 'עגלות מוזגו בהצלחה',
          totalItems: mergedCart.totalItems
        }
      });
    } else {
      res.json({
        success: true,
        message: 'אין פריטים למיזוג'
      });
    }
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במיזוג עגלות הקניות'
    });
  }
});

// @route   GET /api/cart/count
// @desc    Get cart items count only
// @access  Public (with optional auth)
router.get('/count', optionalAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);

    res.json({
      success: true,
      data: {
        totalItems: cart.totalItems,
        sessionId: cart.sessionId || null
      }
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת מספר פריטים'
    });
  }
});

module.exports = router;