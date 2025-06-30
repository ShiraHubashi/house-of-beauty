import { Link } from 'react-router-dom'
import { Search, User, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

function Header() {
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <img src="/images/logo.jpg" alt="בית היופי" className="logo-image" />
          <h1>בית היופי</h1>
        </Link>
        
        <nav className="nav">
          <Link to="/">בית</Link>
          <Link to="/products">מוצרים</Link>
          <Link to="/contact">יצירת קשר</Link>
        </nav>

        <div className="header-actions">
          <Search size={20} className="icon" />
          <User size={20} className="icon" />
          <Link to="/cart" className="cart-link">
            <ShoppingCart size={20} />
            <span className="cart-text">עגלה ({totalItems})</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header