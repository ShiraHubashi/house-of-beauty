# Beauty Store Backend - חנות בית היופי

Backend API server for Beauty Store e-commerce platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization** (JWT)
- **Product Management** with categories and search
- **Shopping Cart** functionality (for authenticated and anonymous users)
- **Order Management** system
- **Contact Messages** handling
- **Image Upload** to Cloudinary
- **Admin Dashboard** capabilities
- **Input Validation** and error handling
- **Rate Limiting** and security middleware

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Image Storage**: Cloudinary
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd beauty-store-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit the `.env` file with your configurations:
- MongoDB connection string
- JWT secret key
- Cloudinary credentials
- Other environment variables

4. **Start MongoDB**
Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Seed the database (optional)**
```bash
npm run seed
```

6. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `JWT_EXPIRES_IN` | JWT token expiration time | ❌ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `PORT` | Server port (default: 5000) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ |

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/logout` | User logout | ✅ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update user profile | ✅ |
| PUT | `/api/auth/change-password` | Change password | ✅ |

### Products Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | ❌ |
| GET | `/api/products/featured` | Get featured products | ❌ |
| GET | `/api/products/categories` | Get product categories | ❌ |
| GET | `/api/products/:id` | Get single product | ❌ |
| POST | `/api/products` | Create new product | ✅ (Admin) |
| PUT | `/api/products/:id` | Update product | ✅ (Admin) |
| DELETE | `/api/products/:id` | Delete product | ✅ (Admin) |

### Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user cart | ❌ |
| POST | `/api/cart/add` | Add item to cart | ❌ |
| PUT | `/api/cart/update` | Update cart item | ❌ |
| DELETE | `/api/cart/remove/:id` | Remove item from cart | ❌ |
| DELETE | `/api/cart/clear` | Clear entire cart | ❌ |

### Orders Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create new order | ✅ |
| GET | `/api/orders` | Get user orders | ✅ |
| GET | `/api/orders/:id` | Get single order | ✅ |
| PUT | `/api/orders/:id/status` | Update order status | ✅ (Admin) |
| POST | `/api/orders/:id/cancel` | Cancel order | ✅ |

### Contact Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/contact` | Submit contact message | ❌ |
| GET | `/api/contact` | Get all messages | ✅ (Admin) |
| GET | `/api/contact/:id` | Get single message | ✅ (Admin) |
| PUT | `/api/contact/:id/status` | Update message status | ✅ (Admin) |

### Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/image` | Upload single image | ✅ (Admin) |
| POST | `/api/upload/multiple` | Upload multiple images | ✅ (Admin) |
| DELETE | `/api/upload/image/:publicId` | Delete image | ✅ (Admin) |
| GET | `/api/upload/images` | Get all images | ✅ (Admin) |

## 🗄️ Database Schema

### Collections

- **Users**: User accounts and profiles
- **Products**: Product catalog with categories
- **Orders**: Customer orders and order items
- **Cart**: Shopping cart items (temporary)
- **ContactMessages**: Contact form submissions

### Indexes

- Text search on product names and descriptions
- User email uniqueness
- Order number uniqueness
- Optimized queries for cart and orders

## 🔐 Security Features

- **JWT Authentication** with secure tokens
- **Password Hashing** using bcrypt
- **Input Validation** with Joi schemas
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Helmet Security** headers
- **File Upload Security** with type validation

## 🧪 Default Users (After Seeding)

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@beautystore.com | admin123456 | Full system access |
| Customer | customer@example.com | customer123 | Regular user account |

## 📁 Project Structure

```
beauty-store-backend/
├── models/              # Mongoose models
├── routes/              # Express route handlers
├── middleware/          # Custom middleware
├── scripts/             # Database seeding scripts
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── README.md           # Project documentation
```

## 🚦 Health Check

The server provides a health check endpoint:

```
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Beauty Store API is running",
  "timestamp": "2025-06-16T10:00:00.000Z"
}
```

## 📝 Available Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@beautystore.com or create an issue in the repository.

---

**Happy coding! 🎉**