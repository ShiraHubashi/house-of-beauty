import { Phone, Mail, MapPin } from 'lucide-react'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>בית היופי</h3>
            <p>החנות שלכם לכל מוצרי הבית והעיצוב</p>
          </div>
          <div className="footer-section">
            <h4>צור קשר</h4>
            <div className="contact-item">
              <Mail size={16} />
              <span>info@beautystore.com</span>
            </div>
            <div className="contact-item">
              <Phone size={16} />
              <span>050-123-4567</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>תל אביב, ישראל</span>
            </div>
          </div>
        </div>
        <div className="footer-copy">
          <p>&copy; 2025 בית היופי. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer