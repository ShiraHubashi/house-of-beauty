const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'ישראל'
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'שם פרטי נדרש'],
    trim: true,
    maxlength: [50, 'שם פרטי לא יכול להיות ארוך מ-50 תווים']
  },
  lastName: {
    type: String,
    required: [true, 'שם משפחה נדרש'],
    trim: true,
    maxlength: [50, 'שם משפחה לא יכול להיות ארוך מ-50 תווים']
  },
  email: {
    type: String,
    required: [true, 'כתובת אימייל נדרשת'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'כתובת אימייל לא חוקית']
  },
  password: {
    type: String,
    required: [true, 'סיסמה נדרשת'],
    minlength: [6, 'סיסמה חייבת להכיל לפחות 6 תווים'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'מספר טלפון נדרש'],
    trim: true,
    match: [/^05\d{8}$/, 'מספר טלפון לא חוקי']
  },
  address: {
    type: addressSchema,
    required: false
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for email lookup
userSchema.index({ email: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Transform output to remove password and other sensitive data
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);