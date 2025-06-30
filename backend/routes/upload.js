const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('רק קבצי תמונה מותרים'), false);
    }
  }
});

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private/Admin
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'לא נבחרה תמונה להעלאה'
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'beauty-store/products',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ],
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    res.json({
      success: true,
      data: {
        imageUrl: result.secure_url,
        imagePublicId: result.public_id,
        width: result.width,
        height: result.height
      },
      message: 'תמונה הועלתה בהצלחה'
    });
  } catch (error) {
    console.error('Image upload error:', error);
    
    if (error.message === 'רק קבצי תמונה מותרים') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'שגיאה בהעלאת התמונה'
    });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images to Cloudinary
// @access  Private/Admin
router.post('/multiple', authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'לא נבחרו תמונות להעלאה'
      });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'beauty-store/products',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' },
              { format: 'auto' }
            ],
            resource_type: 'image'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                imageUrl: result.secure_url,
                imagePublicId: result.public_id,
                width: result.width,
                height: result.height
              });
            }
          }
        ).end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: results,
      message: `${results.length} תמונות הועלו בהצלחה`
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהעלאת התמונות'
    });
  }
});

// @route   DELETE /api/upload/image/:publicId
// @desc    Delete image from Cloudinary
// @access  Private/Admin
router.delete('/image/:publicId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'תמונה נמחקה בהצלחה'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'תמונה לא נמצאה'
      });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת התמונה'
    });
  }
});

// @route   GET /api/upload/images
// @desc    Get all uploaded images from Cloudinary
// @access  Private/Admin
router.get('/images', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await cloudinary.search
      .expression('folder:beauty-store/products')
      .sort_by([['created_at', 'desc']])
      .max_results(Number(limit))
      .next_cursor(page > 1 ? req.query.cursor : undefined)
      .execute();

    const images = result.resources.map(resource => ({
      imageUrl: resource.secure_url,
      imagePublicId: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      size: resource.bytes,
      createdAt: resource.created_at
    }));

    res.json({
      success: true,
      data: {
        images,
        hasMore: !!result.next_cursor,
        nextCursor: result.next_cursor,
        totalCount: result.total_count
      }
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת התמונות'
    });
  }
});

// @route   POST /api/upload/transform
// @desc    Transform existing image
// @access  Private/Admin
router.post('/transform', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { publicId, transformations } = req.body;

    if (!publicId || !transformations) {
      return res.status(400).json({
        success: false,
        message: 'מזהה תמונה וטרנספורמציות נדרשים'
      });
    }

    // Create transformation URL
    const transformedUrl = cloudinary.url(publicId, {
      ...transformations,
      secure: true
    });

    res.json({
      success: true,
      data: {
        originalPublicId: publicId,
        transformedUrl
      },
      message: 'טרנספורמציה נוצרה בהצלחה'
    });
  } catch (error) {
    console.error('Transform image error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטרנספורמציית התמונה'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'קובץ גדול מדי. המגבלה היא 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'יותר מדי קבצים. המגבלה היא 5 קבצים'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'שדה קובץ לא צפוי'
      });
    }
  }
  
  if (error.message === 'רק קבצי תמונה מותרים') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;