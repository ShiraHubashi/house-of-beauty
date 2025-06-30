import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    alert(`${product.name} נוסף לעגלה!`)
  }

  return (
    <Link to={`/product/${product._id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image-container">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="product-image"
          />
          {product.featured && (
            <span className="featured-badge">מומלץ</span>
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          
          <div className="product-footer">
            <div className="price-container">
              <span className="product-price">₪{product.price}</span>
              <span className="product-category">{product.category}</span>
            </div>
            
            {product.inStock ? (
              <button 
                onClick={handleAddToCart}
                className="btn-primary"
              >
                <ShoppingCart size={16} />
                הוסף לעגלה
              </button>
            ) : (
              <button 
                disabled
                className="btn-disabled"
              >
                אזל מהמלאי
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard