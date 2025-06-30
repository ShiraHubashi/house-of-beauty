const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateContact } = require('../middleware/validation');

// @route   POST /api/contact
// @desc    Submit contact message
// @access  Public
router.post('/', validateContact, async (req, res) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;

    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
      category: category || 'general'
    });

    await contactMessage.save();

    res.status(201).json({
      success: true,
      data: {
        id: contactMessage._id,
        message: 'הודעתך נשלחה בהצלחה. נחזור אליך בהקדם האפשרי'
      }
    });
  } catch (error) {
    console.error('Submit contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בשליחת הודעת יצירת קשר'
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      priority,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    // Search in name, email, subject, and message
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const messages = await ContactMessage.find(filter)
      .populate('repliedBy', 'firstName lastName')
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await ContactMessage.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: messages,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalMessages: total,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת הודעות יצירת קשר'
    });
  }
});

// @route   GET /api/contact/stats
// @desc    Get contact message statistics
// @access  Private/Admin
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await ContactMessage.getStatistics();
    
    // Get recent messages
    const recentMessages = await ContactMessage.getRecentMessages(5);
    
    // Get count by priority
    const priorityStats = await ContactMessage.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get count by category
    const categoryStats = await ContactMessage.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        priorityStats,
        categoryStats,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת סטטיסטיקות'
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message
// @access  Private/Admin
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id)
      .populate('repliedBy', 'firstName lastName email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'הודעה לא נמצאה'
      });
    }

    // Mark as read if it's new
    if (message.status === 'new') {
      await message.markAsRead();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'הודעה לא נמצאה'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת ההודעה'
    });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update message status
// @access  Private/Admin
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const validStatuses = ['new', 'read', 'replied', 'closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'סטטוס לא חוקי'
      });
    }

    const updateData = { status };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'replied') {
      updateData.repliedAt = new Date();
      updateData.repliedBy = req.user._id;
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('repliedBy', 'firstName lastName');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'הודעה לא נמצאה'
      });
    }

    res.json({
      success: true,
      data: message,
      message: 'סטטוס ההודעה עודכן בהצלחה'
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון סטטוס ההודעה'
    });
  }
});

// @route   PUT /api/contact/:id/priority
// @desc    Update message priority
// @access  Private/Admin
router.put('/:id/priority', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { priority } = req.body;

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'עדיפות לא חוקית'
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'הודעה לא נמצאה'
      });
    }

    res.json({
      success: true,
      data: message,
      message: 'עדיפות ההודעה עודכנה בהצלחה'
    });
  } catch (error) {
    console.error('Update message priority error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון עדיפות ההודעה'
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'הודעה לא נמצאה'
      });
    }

    res.json({
      success: true,
      message: 'הודעה נמחקה בהצלחה'
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'הודעה לא נמצאה'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת ההודעה'
    });
  }
});

module.exports = router;