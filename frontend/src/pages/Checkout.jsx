import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

function Checkout() {
  const { cart, getTotalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    // פרטים אישיים
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // כתובת משלוח
    street: '',
    city: '',
    zipCode: '',
    
    // תשלום
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // הערות
    notes: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(() => {
      alert('ההזמנה בוצעה בהצלחה! מספר הזמנה: ' + Math.random().toString(36).substr(2, 9).toUpperCase())
      clearCart()
      navigate('/')
    }, 2000)
  }

  if (cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1 className="page-title">העגלה ריקה</h1>
          <p>אין פריטים לתשלום</p>
          <a href="/products" className="btn-primary">חזור לקניות</a>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">השלמת הזמנה 💳</h1>
        
        <div className="checkout-content">
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form">
              
              {/* פרטים אישיים */}
              <div className="form-section">
                <h2>פרטים אישיים</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">שם פרטי *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">שם משפחה *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">אימייל *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">טלפון *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* כתובת משלוח */}
              <div className="form-section">
                <h2>כתובת משלוח</h2>
                <div className="form-group">
                  <label htmlFor="street">רחוב ומספר בית *</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">עיר *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode">מיקוד *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* אמצעי תשלום */}
              <div className="form-section">
                <h2>אמצעי תשלום</h2>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={formData.paymentMethod === 'credit_card'}
                      onChange={handleChange}
                    />
                    כרטיס אשראי
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                    />
                    PayPal
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleChange}
                    />
                    העברה בנקאית
                  </label>
                </div>

                {formData.paymentMethod === 'credit_card' && (
                  <div className="credit-card-section">
                    <div className="form-group">
                      <label htmlFor="cardNumber">מספר כרטיס *</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required={formData.paymentMethod === 'credit_card'}
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiryDate">תוקף *</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          required={formData.paymentMethod === 'credit_card'}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cvv">CVV *</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          maxLength="4"
                          required={formData.paymentMethod === 'credit_card'}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="cardName">שם בעל הכרטיס *</label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        required={formData.paymentMethod === 'credit_card'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* הערות */}
              <div className="form-section">
                <h2>הערות להזמנה</h2>
                <div className="form-group">
                  <label htmlFor="notes">הערות (אופציונלי)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="הערות מיוחדות להזמנה..."
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary complete-order-btn"
                disabled={isProcessing}
              >
                {isProcessing ? 'מעבד הזמנה...' : `השלם הזמנה - ₪${getTotalPrice()}`}
              </button>
            </form>
          </div>

          {/* סיכום הזמנה */}
          <div className="order-summary">
            <h2>סיכום הזמנה</h2>
            
            <div className="order-items">
              {cart.items.map(item => (
                <div key={item._id} className="order-item">
                  <img src={item.imageUrl} alt={item.name} />
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    <p>כמות: {item.quantity}</p>
                    <p>₪{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-line">
                <span>משלוח:</span>
                <span>חינם</span>
              </div>
              <div className="total-line final-total">
                <span>סה"כ לתשלום:</span>
                <span>₪{getTotalPrice()}</span>
              </div>
            </div>
            
            <div className="security-note">
               התשלום מאובטח ומוצפן
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout