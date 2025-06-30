const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    next();
  };
};

// User registration validation
const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'שם פרטי נדרש',
      'string.min': 'שם פרטי חייב להכיל לפחות 2 תווים',
      'string.max': 'שם פרטי לא יכול להיות ארוך מ-50 תווים'
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'שם משפחה נדרש',
      'string.min': 'שם משפחה חייב להכיל לפחות 2 תווים',
      'string.max': 'שם משפחה לא יכול להיות ארוך מ-50 תווים'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'כתובת אימייל לא חוקית',
      'string.empty': 'כתובת אימייל נדרשת'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'סיסמה חייבת להכיל לפחות 6 תווים',
      'string.empty': 'סיסמה נדרשת'
    }),
  phone: Joi.string()
    .pattern(/^05\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'מספר טלפון לא חוקי',
      'string.empty': 'מספר טלפון נדרש'
    })
});

// User login validation
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'כתובת אימייל לא חוקית',
      'string.empty': 'כתובת אימייל נדרשת'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'סיסמה נדרשת'
    })
});

// Product validation
const productSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'שם המוצר נדרש',
      'string.min': 'שם המוצר חייב להכיל לפחות 2 תווים',
      'string.max': 'שם המוצר לא יכול להיות ארוך מ-100 תווים'
    }),
  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'תיאור המוצר נדרש',
      'string.min': 'תיאור המוצר חייב להכיל לפחות 10 תווים',
      'string.max': 'תיאור המוצר לא יכול להיות ארוך מ-1000 תווים'
    }),
  price: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'מחיר המוצר חייב להיות חיובי',
      'any.required': 'מחיר המוצר נדרש'
    }),
  category: Joi.string()
    .valid('כלי בית', 'תאורה', 'טקסטיל', 'ריחות', 'צמחים', 'שטיחים', 'אקססוריז', 'אמנות')
    .required()
    .messages({
      'any.only': 'קטגוריה לא חוקית',
      'any.required': 'קטגוריה נדרשת'
    }),
  stockQuantity: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'כמות במלאי לא יכולה להיות שלילית',
      'any.required': 'כמות במלאי נדרשת'
    }),
  featured: Joi.boolean().default(false)
});

// Cart item validation
const cartItemSchema = Joi.object({
  productId: Joi.string()
    .required()
    .messages({
      'string.empty': 'מזהה מוצר נדרש'
    }),
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.min': 'כמות חייבת להיות לפחות 1',
      'number.max': 'כמות לא יכולה להיות יותר מ-100',
      'any.required': 'כמות נדרשת'
    })
});

// Order validation
const orderSchema = Joi.object({
  items: Joi.array()
    .items(Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    }))
    .min(1)
    .required()
    .messages({
      'array.min': 'הזמנה חייבת להכיל לפחות פריט אחד',
      'any.required': 'פריטים נדרשים'
    }),
  shippingAddress: Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    street: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    zipCode: Joi.string().trim().required(),
    country: Joi.string().trim().default('ישראל'),
    phone: Joi.string().pattern(/^05\d{8}$/).required()
  }).required(),
  paymentMethod: Joi.string()
    .valid('credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery')
    .required()
    .messages({
      'any.only': 'אמצעי תשלום לא חוקי',
      'any.required': 'אמצעי תשלום נדרש'
    }),
  notes: Joi.string().max(500).allow('')
});

// Contact message validation
const contactSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'שם נדרש',
      'string.min': 'שם חייב להכיל לפחות 2 תווים',
      'string.max': 'שם לא יכול להיות ארוך מ-100 תווים'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'כתובת אימייל לא חוקית',
      'string.empty': 'כתובת אימייל נדרשת'
    }),
  phone: Joi.string()
    .pattern(/^05\d{8}$/)
    .allow('')
    .messages({
      'string.pattern.base': 'מספר טלפון לא חוקי'
    }),
  subject: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'נושא נדרש',
      'string.min': 'נושא חייב להכיל לפחות 2 תווים',
      'string.max': 'נושא לא יכול להיות ארוך מ-200 תווים'
    }),
  message: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'הודעה נדרשת',
      'string.min': 'הודעה חייבת להכיל לפחות 10 תווים',
      'string.max': 'הודעה לא יכולה להיות ארוכה מ-2000 תווים'
    }),
  category: Joi.string()
    .valid('general', 'support', 'complaint', 'suggestion', 'order', 'product')
    .default('general')
});

module.exports = {
  validate,
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateProduct: validate(productSchema),
  validateCartItem: validate(cartItemSchema),
  validateOrder: validate(orderSchema),
  validateContact: validate(contactSchema)
};