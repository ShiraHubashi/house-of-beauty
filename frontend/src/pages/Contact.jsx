import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSubmitMessage('ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          category: 'general'
        })
      } else {
        setSubmitMessage('שגיאה בשליחת ההודעה. נסה שוב.')
      }
    } catch (error) {
      setSubmitMessage('שגיאה בשליחת ההודעה. נסה שוב.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <div className="container">
        <h1 className="page-title">צור קשר</h1>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>פרטי יצירת קשר</h2>
            
            <div className="contact-item">
              <Mail size={20} className="contact-icon" />
              <div>
                <h3>אימייל</h3>
                <p>info@beautystore.com</p>
              </div>
            </div>
            
            <div className="contact-item">
              <Phone size={20} className="contact-icon" />
              <div>
                <h3>טלפון</h3>
                <p>050-123-4567</p>
              </div>
            </div>
            
            <div className="contact-item">
              <MapPin size={20} className="contact-icon" />
              <div>
                <h3>כתובת</h3>
                <p>רחוב הראשי 123<br />תל אביב, ישראל</p>
              </div>
            </div>
            
            <div className="contact-item">
              <Clock size={20} className="contact-icon" />
              <div>
                <h3>שעות פעילות</h3>
                <p>
                  ראשון - חמישי: 9:00 - 18:00<br />
                  יום שישי: 9:00 - 14:00<br />
                  שבת: סגור
                </p>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>שלח לנו הודעה</h2>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">שם מלא *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="הכנס את שמך המלא"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">אימייל *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">טלפון</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="050-1234567"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">נושא הפניה</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="general">כללי</option>
                    <option value="support">תמיכה טכנית</option>
                    <option value="order">שאלה על הזמנה</option>
                    <option value="product">שאלה על מוצר</option>
                    <option value="complaint">תלונה</option>
                    <option value="suggestion">הצעה לשיפור</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">נושא ההודעה *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="כתוב את נושא ההודעה"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">ההודעה *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="כתוב את הודעתך כאן..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn-primary submit-btn"
                disabled={isSubmitting}
              >
                <Send size={18} />
                {isSubmitting ? 'שולח...' : 'שלח הודעה'}
              </button>
            </form>

            {submitMessage && (
              <div className={`submit-message ${submitMessage.includes('בהצלחה') ? 'success' : 'error'}`}>
                {submitMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact