const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'שם נדרש'],
    trim: true,
    maxlength: [100, 'שם לא יכול להיות ארוך מ-100 תווים']
  },
  email: {
    type: String,
    required: [true, 'כתובת אימייל נדרשת'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'כתובת אימייל לא חוקית']
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    match: [/^05\d{8}$|^$/, 'מספר טלפון לא חוקי']
  },
  subject: {
    type: String,
    required: [true, 'נושא נדרש'],
    trim: true,
    maxlength: [200, 'נושא לא יכול להיות ארוך מ-200 תווים']
  },
  message: {
    type: String,
    required: [true, 'הודעה נדרשת'],
    trim: true,
    maxlength: [2000, 'הודעה לא יכולה להיות ארוכה מ-2000 תווים']
  },
  status: {
    type: String,
    enum: {
      values: ['new', 'read', 'replied', 'closed'],
      message: 'סטטוס לא חוקי'
    },
    default: 'new'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'עדיפות לא חוקית'
    },
    default: 'medium'
  },
  category: {
    type: String,
    enum: {
      values: ['general', 'support', 'complaint', 'suggestion', 'order', 'product'],
      message: 'קטגוריה לא חוקית'
    },
    default: 'general'
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'הערות מנהל לא יכולות להיות ארוכות מ-1000 תווים']
  },
  repliedAt: {
    type: Date
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ category: 1 });
contactMessageSchema.index({ priority: 1 });

// Virtual for checking if message is new
contactMessageSchema.virtual('isNew').get(function() {
  return this.status === 'new';
});

// Virtual for checking if message needs reply
contactMessageSchema.virtual('needsReply').get(function() {
  return ['new', 'read'].includes(this.status);
});

// Method to mark as read
contactMessageSchema.methods.markAsRead = function() {
  if (this.status === 'new') {
    this.status = 'read';
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark as replied
contactMessageSchema.methods.markAsReplied = function(adminId) {
  this.status = 'replied';
  this.repliedAt = new Date();
  if (adminId) {
    this.repliedBy = adminId;
  }
  return this.save();
};

// Method to close message
contactMessageSchema.methods.closeMessage = function() {
  this.status = 'closed';
  return this.save();
};

// Static method to get message statistics
contactMessageSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get recent messages
contactMessageSchema.statics.getRecentMessages = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('repliedBy', 'firstName lastName');
};

module.exports = mongoose.model('ContactMessage', contactMessageSchema);