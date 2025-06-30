import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function ProductPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    alert(`${quantity} פריטים מ-${product.name} נוספו לעגלה!`)
  }

  if (loading) {
    return <div className="loading">טוען מוצר...</div>
  }

  if (!product) {
    return <div className="error">מוצר לא נמצא</div>
  }

  return (
    <div className="product-page">
      <div className="container">
        <div className="product-details">
          <div className="product-image-section">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="product-main-image"
            />
          </div>
          
          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-category">{product.category}</p>
            <p className="product-price">₪{product.price}</p>
            
            <div className="product-description">
              <h3>תיאור המוצר</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <label>כמות:</label>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>

              {product.inStock ? (
                <button 
                  onClick={handleAddToCart}
                  className="btn-primary add-to-cart-btn"
                >
                  🛒 הוסף לעגלה
                </button>
              ) : (
                <button disabled className="btn-disabled">
                  אזל מהמלאי
                </button>
              )}
            </div>

            <div className="product-stock">
              {product.inStock ? (
                <span className="in-stock"> זמין במלאי ({product.stockQuantity} יחידות)</span>
              ) : (
                <span className="out-of-stock"> אזל מהמלאי</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage