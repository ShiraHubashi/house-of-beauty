import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/featured')
      const data = await response.json()
      
      if (data.success) {
        setFeaturedProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={homeStyle}>
      {/* Hero Section */}
      <section style={heroStyle}>
        <div className="container" style={containerStyle}>
          <h1 style={heroTitleStyle}>ברוכים הבאים לבית היופי </h1>
          <p style={heroTextStyle}>
            גלו את קולקציית מוצרי הבית והעיצוב היפים ביותר
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section style={sectionStyle}>
        <div className="container" style={containerStyle}>
          <h2 style={sectionTitleStyle}>מוצרים מומלצים </h2>
          
          {loading ? (
            <div style={loadingStyle}>טוען מוצרים...</div>
          ) : (
            <div style={productsGridStyle}>
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const homeStyle = {
  minHeight: '100vh'
}

const heroStyle = {
  background: '#C5B5B9',  // במקום הגרדיאנט הכחול
  color: 'var(--black)',       // טקסט שחור במקום לבן
  padding: '4rem 0',
  textAlign: 'center'
}

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px'
}

const heroTitleStyle = {
  fontSize: '3rem',
  marginBottom: '1rem',
  fontWeight: 'bold'
}

const heroTextStyle = {
  fontSize: '1.2rem',
  opacity: 0.9
}

const sectionStyle = {
  padding: '4rem 0'
}

const sectionTitleStyle = {
  textAlign: 'center',
  fontSize: '2.5rem',
  marginBottom: '3rem',
  color: '#2c3e50'
}

const loadingStyle = {
  textAlign: 'center',
  fontSize: '1.2rem',
  padding: '2rem'
}

const productsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '2rem'
}

export default Home