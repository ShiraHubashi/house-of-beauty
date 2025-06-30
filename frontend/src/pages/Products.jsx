import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      let url = 'http://localhost:5000/api/products'
      if (selectedCategory !== 'all') {
        url += `?category=${selectedCategory}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'all',
    'כלי בית',
    'תאורה', 
    'טקסטיל',
    'ריחות',
    'צמחים',
    'שטיחים',
    'אקססוריז',
    'אמנות'
  ]

  return (
    <div className="products-page">
      <div className="container">
        <h1 className="page-title">כל המוצרים </h1>
        
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category === 'all' ? 'הכל' : category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">טוען מוצרים...</div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products