import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Zap, Settings, MessageCircle, ChevronLeft, ChevronRight, Home } from "lucide-react"
import { db } from "../database/db.js"
import "./ProductDetail.css"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [isLiked, setIsLiked] = useState(false)
  const [commentForm, setCommentForm] = useState({
    reviewer_name: "",
    rating: 5,
    comment: ""
  })
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  const loadProduct = () => {
    try {
      setLoading(true)
      const productData = db.getProduct(parseInt(id))
      
      if (!productData) {
        navigate('/')
        return
      }

      const fullProduct = {
        ...productData,
        features: db.getFeaturesByProduct(productData.id) || [],
        specifications: db.getSpecificationsByProduct(productData.id) || [],
        images: db.getImagesByProduct(productData.id) || [],
        reviews: db.getReviewsByProduct(productData.id) || [],
        mainImage: db.getMainImage(productData.id) || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
      }
      
      setProduct(fullProduct)
    } catch (error) {
      console.error("Error loading product:", error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
    return (sum / reviews.length).toFixed(1)
  }

  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setActiveImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setActiveImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      )
    }
  }

  const getCurrentImage = () => {
    if (!product || !product.images || product.images.length === 0) {
      return product?.mainImage || product?.main_image || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
    }
    
    const currentImage = product.images[activeImageIndex]
    return currentImage?.image || product.mainImage || product?.main_image || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    
    if (!commentForm.reviewer_name.trim() || !commentForm.comment.trim()) {
      alert('لطفاً نام و نظر خود را وارد کنید')
      return
    }

    setIsSubmittingComment(true)
    
    try {
      const newReview = {
        product_id: product.id,
        reviewer_name: commentForm.reviewer_name.trim(),
        rating: commentForm.rating,
        comment: commentForm.comment.trim(),
        approved: true
      }
      
      db.createReview(newReview)
      
      const updatedProduct = {
        ...product,
        reviews: db.getReviewsByProduct(product.id)
      }
      setProduct(updatedProduct)
      
      setCommentForm({
        reviewer_name: "",
        rating: 5,
        comment: ""
      })
      
      alert('نظر شما با موفقیت ثبت شد!')
      
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('خطا در ثبت نظر. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleCommentFormChange = (field, value) => {
    setCommentForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getReviewerInitial = (reviewerName) => {
    if (!reviewerName || typeof reviewerName !== 'string') {
      return '?'
    }
    return reviewerName.charAt(0).toUpperCase()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'تاریخ نامشخص'
    try {
      return new Date(dateString).toLocaleDateString('fa-IR')
    } catch (error) {
      return 'تاریخ نامشخص'
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('لینک کپی شد!')
    }
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
            <Star className="star-icon" fill={starValue <= (hoverRating || rating) ? "#ffb527" : "none"} />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <div className="not-found-content">
          <h2>محصول یافت نشد</h2>
          <p>متأسفانه محصول مورد نظر شما یافت نشد.</p>
          <button onClick={() => navigate('/products')} className="back-home-btn">
            <Home className="icon" />
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-background">
          {product.background_video ? (
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="hero-bg-video"
            >
              <source src={product.background_video} type="video/mp4" />
            </video>
          ) : (
            <img 
              src={getCurrentImage()} 
              alt={product.title}
              className="hero-bg-image"
            />
          )}
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-navigation">
            <button onClick={() => navigate('/products')} className="back-btn">
              <ArrowLeft className="icon" />
              <span>بازگشت</span>
            </button>
            
            <div className="hero-actions">
              <button 
                onClick={() => setIsLiked(!isLiked)} 
                className={`action-btn ${isLiked ? 'liked' : ''}`}
              >
                <Heart className="icon" fill={isLiked ? "#ff6b6b" : "none"} />
              </button>
              <button onClick={handleShare} className="action-btn">
                <Share2 className="icon" />
              </button>
            </div>
          </div>
          
          <div className="hero-info">
            {product.is_featured && (
              <div className="featured-badge">
                <Star className="icon" />
                <span>محصول ویژه</span>
              </div>
            )}
            
            <h1 className="product-title">{product.title}</h1>
            
            <div className="product-rating">
              <StarRating 
                rating={Math.floor(calculateAverageRating(product.reviews))} 
                readonly={true}
                size="large"
              />
              <span className="rating-text">
                {calculateAverageRating(product.reviews)} ({product.reviews.length} نظر)
              </span>
            </div>
            
            <p className="product-description">{product.description}</p>
            
            <div className="hero-cta">
              <button className="cta-btn primary">
                <ShoppingCart className="icon" />
                <span>سفارش محصول</span>
              </button>
              <button className="cta-btn secondary">
                <MessageCircle className="icon" />
                <span>تماس با ما</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="image-gallery-section">
        <div className="container">
          <div className="gallery-main">
            <div className="main-image-container">
              <img 
                src={getCurrentImage()} 
                alt={product.title}
                className="main-image"
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button className="gallery-nav prev" onClick={prevImage}>
                    <ChevronLeft className="icon" />
                  </button>
                  <button className="gallery-nav next" onClick={nextImage}>
                    <ChevronRight className="icon" />
                  </button>
                </>
              )}
              <div className="image-indicator">
                {activeImageIndex + 1} / {product.images?.length || 1}
              </div>
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-grid">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img 
                      src={image.image} 
                      alt={`${product.title} ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="product-details-section">
        <div className="container">
          <div className="details-tabs">
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                <MessageCircle className="icon" />
                <span>توضیحات</span>
              </button>
              
              {product.features && product.features.length > 0 && (
                <button 
                  className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                  onClick={() => setActiveTab('features')}
                >
                  <Zap className="icon" />
                  <span>ویژگی‌ها</span>
                </button>
              )}
              
              {product.specifications && product.specifications.length > 0 && (
                <button 
                  className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  <Settings className="icon" />
                  <span>مشخصات</span>
                </button>
              )}
              
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <Star className="icon" />
                <span>نظرات</span>
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-panel description-panel">
                  <div className="panel-header">
                    <h3>درباره این محصول</h3>
                    <p>اطلاعات کامل و جزئیات محصول</p>
                  </div>
                  <div className="description-content">
                    <p>{product.description}</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'features' && product.features && product.features.length > 0 && (
                <div className="tab-panel features-panel">
                  <div className="panel-header">
                    <h3>ویژگی‌های محصول</h3>
                    <p>امکانات و قابلیت‌های خاص این محصول</p>
                  </div>
                  <div className="features-grid">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="feature-card">
                        <div className="feature-icon">
                          <Zap className="icon" />
                        </div>
                        <div className="feature-content">
                          <h4>ویژگی {idx + 1}</h4>
                          <p>{feature.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'specs' && product.specifications && product.specifications.length > 0 && (
                <div className="tab-panel specs-panel">
                  <div className="panel-header">
                    <h3>مشخصات فنی</h3>
                    <p>جزئیات فنی و اطلاعات دقیق محصول</p>
                  </div>
                  <div className="specs-table">
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className="spec-row">
                        <div className="spec-label">{spec.name}</div>
                        <div className="spec-value">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="tab-panel reviews-panel">
                  <div className="panel-header">
                    <h3>نظرات کاربران</h3>
                    <p>تجربه و نظرات سایر کاربران</p>
                  </div>
                  
                  {product.reviews && product.reviews.length > 0 && (
                    <div className="reviews-summary">
                      <div className="summary-stats">
                        <div className="avg-rating">
                          <span className="rating-number">{calculateAverageRating(product.reviews)}</span>
                          <StarRating 
                            rating={Math.floor(calculateAverageRating(product.reviews))} 
                            readonly={true}
                            size="medium"
                          />
                        </div>
                        <div className="total-reviews">
                          {product.reviews.length} نظر ثبت شده
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="comment-form">
                    <h4>نظر خود را بنویسید</h4>
                    <form onSubmit={handleCommentSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>نام شما</label>
                          <input
                            type="text"
                            value={commentForm.reviewer_name}
                            onChange={(e) => handleCommentFormChange('reviewer_name', e.target.value)}
                            placeholder="نام خود را وارد کنید"
                            required
                            disabled={isSubmittingComment}
                          />
                        </div>
                        <div className="form-group">
                          <label>امتیاز شما</label>
                          <StarRating 
                            rating={commentForm.rating}
                            onRatingChange={(rating) => handleCommentFormChange('rating', rating)}
                            readonly={isSubmittingComment}
                            size="medium"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>نظر شما</label>
                        <textarea
                          value={commentForm.comment}
                          onChange={(e) => handleCommentFormChange('comment', e.target.value)}
                          placeholder="نظر خود را در مورد این محصول بنویسید..."
                          rows={4}
                          required
                          disabled={isSubmittingComment}
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isSubmittingComment}
                      >
                        {isSubmittingComment ? 'در حال ارسال...' : 'ثبت نظر'}
                      </button>
                    </form>
                  </div>
                  
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="reviews-list">
                      {product.reviews.map((review, idx) => (
                        <div key={idx} className="review-card">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer-avatar">
                                {getReviewerInitial(review.reviewer_name)}
                              </div>
                              <div className="reviewer-details">
                                <h5>{review.reviewer_name}</h5>
                                <span className="review-date">{formatDate(review.created_at)}</span>
                              </div>
                            </div>
                            <StarRating 
                              rating={review.rating || 0}
                              readonly={true}
                              size="small"
                            />
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-reviews">
                      <p>هنوز نظری برای این محصول ثبت نشده است. اولین نفری باشید که نظر می‌دهد!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductDetail