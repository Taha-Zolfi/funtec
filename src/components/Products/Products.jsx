import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../database/db.js"
import "./Products.css"

const Products = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentSection, setCurrentSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm])

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.snap-container')
      if (container) {
        const scrollTop = container.scrollTop
        const scrollHeight = container.scrollHeight - container.clientHeight
        const progress = (scrollTop / scrollHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, progress)))
        
        const sectionHeight = container.clientHeight
        const currentSectionIndex = Math.round(scrollTop / sectionHeight)
        setCurrentSection(currentSectionIndex)
      }
    }

    const container = document.querySelector('.snap-container')
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px 0px -100px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      })
    }, observerOptions)

    const elements = document.querySelectorAll(".scroll-animate")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [filteredProducts])

  const loadProducts = () => {
    try {
      const allProducts = db.getProducts().map((product) => ({
        ...product,
        features: db.getFeaturesByProduct(product.id) || [],
        specifications: db.getSpecificationsByProduct(product.id) || [],
        images: db.getImagesByProduct(product.id) || [],
        reviews: db.getReviewsByProduct(product.id) || [],
        mainImage: db.getMainImage(product.id) || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
      }))
      setProducts(allProducts)
    } catch (error) {
      console.error("Error loading products:", error)
      setProducts([])
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((product) => {
        const titleMatch = product.title?.toLowerCase().includes(searchLower)
        const descMatch = product.description?.toLowerCase().includes(searchLower)
        const featureMatch = product.features?.some(f => 
          f.value?.toLowerCase().includes(searchLower)
        )
        const specMatch = product.specifications?.some(s => 
          s.name?.toLowerCase().includes(searchLower) || 
          s.value?.toLowerCase().includes(searchLower)
        )
        
        return titleMatch || descMatch || featureMatch || specMatch
      })
    }

    setFilteredProducts(filtered)
  }

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
    return (sum / reviews.length).toFixed(1)
  }

  const openProductDetail = (product) => {
    navigate(`/product/${product.id}`)
  }

  const scrollToSection = (sectionIndex) => {
    const container = document.querySelector('.snap-container')
    if (container) {
      const sectionHeight = container.clientHeight
      container.scrollTo({
        top: sectionIndex * sectionHeight,
        behavior: 'smooth'
      })
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, readonly = false, size = "medium" }) => {
    const [hoverRating, setHoverRating] = useState(0)
    
    const handleStarClick = (starValue) => {
      if (!readonly && onRatingChange) {
        onRatingChange(starValue)
      }
    }
    
    const handleStarHover = (starValue) => {
      if (!readonly) {
        setHoverRating(starValue)
      }
    }
    
    const handleStarLeave = () => {
      if (!readonly) {
        setHoverRating(0)
      }
    }
    
    return (
      <div className={`star-rating ${size} ${readonly ? 'readonly' : 'interactive'}`}>
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            className={`star-button ${
              starValue <= (hoverRating || rating) ? 'filled' : 'empty'
            }`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            onMouseLeave={handleStarLeave}
            disabled={readonly}
            aria-label={`${starValue} ستاره`}
          >
            <svg viewBox="0 0 24 24" className="star-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="persian-products snap-container">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div 
          className="scroll-progress-bar" 
          style={{ height: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Navigation Dots */}
      <div className="navigation-dots">
        <button 
          className={`nav-dot ${currentSection === 0 ? 'active' : ''}`}
          onClick={() => scrollToSection(0)}
          aria-label="برو به بالای صفحه"
        >
          <span className="dot-tooltip">صفحه اصلی</span>
        </button>
        
        {filteredProducts.map((product, index) => (
          <button 
            key={product.id}
            className={`nav-dot ${currentSection === index + 1 ? 'active' : ''}`}
            onClick={() => scrollToSection(index + 1)}
            aria-label={`برو به ${product.title}`}
          >
            <span className="dot-tooltip">{product.title}</span>
          </button>
        ))}
        
        {filteredProducts.length === 0 && searchTerm && (
          <button 
            className={`nav-dot ${currentSection === 1 ? 'active' : ''}`}
            onClick={() => scrollToSection(1)}
            aria-label="هیچ محصولی یافت نشد"
          >
            <span className="dot-tooltip">نتیجه‌ای یافت نشد</span>
          </button>
        )}
      </div>

      {/* Header Section */}
      <header className="page-header snap-section">
        <div className="header-background">
          <div className="animated-bg">
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
              <div className="shape shape-5"></div>
              <div className="shape shape-6"></div>
            </div>
            <div className="grid-overlay"></div>
            <div className="particle-field"></div>
          </div>
        </div>
        
        <div className="header-content">
          <div className="hero-section">
            <div className="title-container">
              <h1 className="main-title">
                <span className="title-word">محصولات</span>
              </h1>
            </div>
            
            <p className="main-subtitle">
              <span className="subtitle-line">انواع محصولات شهربازی با کیفیت برتر</span>
            </p>
          </div>
          
          {/* Modern Search Section */}
          <div className="search-section">
            <div className={`modern-search-container ${searchFocused ? 'focused' : ''}`}>
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="جستجو در محصولات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="modern-search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={clearSearch}
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
              
              {searchTerm && (
                <div className="search-results-info">
                  <span className="results-count">
                    {filteredProducts.length} محصول یافت شد
                  </span>
                  {filteredProducts.length > 0 && (
                    <span className="results-hint">
                      برای مشاهده جزئیات روی محصول کلیک کنید
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Product Sections */}
      {filteredProducts.map((product, index) => (
        <section key={product.id} className="product-section scroll-animate snap-section">
          <div className="section-background">
            {product.background_video ? (
              <video 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="bg-video"
              >
                <source src={product.background_video} type="video/mp4" />
              </video>
            ) : (
              <img 
                src={product.mainImage || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"} 
                alt={product.title || 'محصول'}
                className="bg-image"
              />
            )}
            <div className="dark-overlay"></div>
          </div>

          <div className="section-content">
            <div className="product-info">
              {product.is_featured && (
                <div className="featured-tag">
                  <span className="star-icon">⭐</span>
                  <span>محصول ویژه</span>
                </div>
              )}

              <h2 className="product-title">{product.title || 'محصول بدون نام'}</h2>
              
              <div className="rating-section">
                <StarRating 
                  rating={Math.floor(calculateAverageRating(product.reviews))} 
                  readonly={true}
                  size="small"
                />
                <span className="rating-info">
                  {calculateAverageRating(product.reviews)} ({(product.reviews || []).length} نظر)
                </span>
              </div>

              <p className="product-desc">{product.description || 'توضیحی برای این محصول موجود نیست.'}</p>

              <button 
                type="button"
                className="btn details-btn"
                onClick={() => openProductDetail(product)}
              >
                <span className="details-btn-text">مشاهده جزئیات</span>
                <div id="container-stars">
                  <div id="stars"></div>
                </div>
                <div id="glow">
                  <div className="circle"></div>
                  <div className="circle"></div>
                </div>
              </button>
            </div>
          </div>
        </section>
      ))}

      {/* Empty State */}
      {filteredProducts.length === 0 && searchTerm && (
        <section className="empty-state scroll-animate snap-section">
          <div className="empty-content">
            <div className="empty-icon">🔍</div>
            <h3>محصولی با این جستجو یافت نشد</h3>
            <p>کلمات کلیدی دیگری امتحان کنید یا جستجو را پاک کنید</p>
            <button 
              className="reset-btn"
              onClick={clearSearch}
            >
              پاک کردن جستجو
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default Products