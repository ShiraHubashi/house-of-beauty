const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authenticateToken, validateOrder, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate and process items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `מוצר עם מזהה ${item.productId} לא נמצא`
        });
      }

      if (!product.inStock || product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `מוצר "${product.name}" לא זמין במלאי הנדרש`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        imageUrl: product.imageUrl
      });
    }

    // Create order
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      await product.decreaseStock(item.quantity);
    }

    // Clear user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      await cart.clearCart();
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'הזמנה נוצרה בהצלחה'
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.message === 'Not enough stock available') {
      return res.status(400).json({
        success: false,
        message: 'אין מספיק מלאי זמין'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת ההזמנה'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders or all orders (admin)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    // Non-admin users can only see their own orders
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    
    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const orders = await Order.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalOrders: total,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת ההזמנות'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'הזמנה לא נמצאה'
      });
    }

    // Non-admin users can only see their own orders
    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'אין הרשאה לצפייה בהזמנה זו'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'הזמנה לא נמצאה'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת ההזמנה'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'סטטוס לא חוקי'
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'הזמנה לא נמצאה'
      });
    }

    // Handle stock restoration for cancelled orders
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          await product.increaseStock(item.quantity);
        }
      }
    }

    // Update order
    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email');

    res.json({
      success: true,
      data: updatedOrder,
      message: 'סטטוס ההזמנה עודכן בהצלחה'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון סטטוס ההזמנה'
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics
// @access  Private/Admin
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Order.getStatistics();
    
    // Get additional stats
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת סטטיסטיקות'
    });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order (user can cancel pending orders)
// @access  Private
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'הזמנה לא נמצאה'
      });
    }

    // Check ownership (non-admin users can only cancel their own orders)
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'אין הרשאה לביטול הזמנה זו'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'לא ניתן לבטל הזמנה עם סטטוס זה'
      });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        await product.increaseStock(item.quantity);
      }
    }

    // Update order status
    await order.updateStatus('cancelled');

    res.json({
      success: true,
      data: order,
      message: 'הזמנה בוטלה בהצלחה'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בביטול ההזמנה'
    });
  }
});

// @route   GET /api/orders/user/:userId
// @desc    Get orders for specific user (admin only)
// @access  Private/Admin
router.get('/user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find({ userId: req.params.userId })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments({ userId: req.params.userId });
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalOrders: total,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת הזמנות המשתמש'
    });
  }
});

module.exports = router;