import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart()

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">עגלת הקניות </h1>
          <div className="empty-cart">
            <p>העגלה שלך ריקה כרגע</p>
            <a href="/products" className="btn-primary">המשך לקנות</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">עגלת הקניות </h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item._id} className="cart-item">
                <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">₪{item.price}</p>
                </div>
                
                <div className="cart-item-quantity">
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                
                <div className="cart-item-total">
                  ₪{item.price * item.quantity}
                </div>
                
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="remove-btn"
                >
                  
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>סיכום הזמנה</h3>
            <p>סה"כ: ₪{getTotalPrice()}</p>
            <Link to="/checkout" className="btn-primary checkout-btn">מעבר לתשלום</Link>
            <button onClick={clearCart} className="btn-secondary clear-btn">רוקן עגלה</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart