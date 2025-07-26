import { useState, useEffect } from "react"
import { db } from "../database/db.js"
import "./AdminPanel.css"

const ADMIN_PASSWORD = "LaserTech2024!"

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("")

  // Load data
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = () => {
    setProducts(db.getProducts())
    setStats(db.getStats())
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setPassword("")
    } else {
      alert("رمز عبور اشتباه است!")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
  }

  const openModal = (type, product = null) => {
    setModalType(type)
    setSelectedProduct(product)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
    setModalType("")
    loadData()
  }

  const handleClearAllData = () => {
    if (window.confirm("آیا مطمئن هستید؟ تمام داده‌ها پاک خواهد شد!")) {
      db.clearAllData()
      loadData()
    }
  }

  const handleDeleteProduct = (id) => {
    if (window.confirm("آیا مطمئن هستید؟")) {
      db.deleteProduct(id)
      loadData()
    }
  }

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>🔐 ورود به پنل مدیریت</h2>
          <p className="password-hint">
            رمز عبور: <code>{ADMIN_PASSWORD}</code>
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="رمز عبور را وارد کنید"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">ورود</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>🔧 Admin Panel</h2>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 خروج
          </button>
        </div>
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 داشبورد
          </button>
          <button
            className={`nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            📦 مدیریت محصولات
          </button>
          <button
            className={`nav-item ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            💬 نظرات
          </button>
          <button
            className={`nav-item ${activeTab === "news" ? "active" : ""}`}
            onClick={() => setActiveTab("news")}
          >
            📰 مدیریت اخبار
          </button>
        </nav>
        <div className="admin-actions">
          <button className="danger-btn" onClick={handleClearAllData}>
            🗑️ پاک کردن همه
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {activeTab === "dashboard" && <Dashboard stats={stats} />}
        {activeTab === "products" && (
          <ProductsTab
            products={products}
            onEdit={(product) => openModal("edit-product", product)}
            onCreate={() => openModal("create-product")}
            onDelete={handleDeleteProduct}
          />
        )}
        {activeTab === "reviews" && <ReviewsTab onRefresh={loadData} />}
        {activeTab === "news" && (
          <NewsTab
            onEdit={(news) => openModal("edit-news", news)}
            onCreate={() => openModal("create-news")}
            onRefresh={loadData}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <>
          {(modalType === "create-product" || modalType === "edit-product") && (
            <ProductModal type={modalType} product={selectedProduct} onClose={closeModal} />
          )}
          {(modalType === "create-news" || modalType === "edit-news") && (
            <NewsModal type={modalType} news={selectedProduct} onClose={closeModal} />
          )}
        </>
      )}
    </div>
  )
}

// Dashboard Component
const Dashboard = ({ stats }) => (
  <div className="dashboard">
    <h1>📊 داشبورد</h1>
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-info">
          <h3>{stats.total_products || 0}</h3>
          <p>کل محصولات</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⭐</div>
        <div className="stat-info">
          <h3>{stats.featured_products || 0}</h3>
          <p>محصولات ویژه</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">💬</div>
        <div className="stat-info">
          <h3>{stats.total_reviews || 0}</h3>
          <p>نظرات تایید شده</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🌟</div>
        <div className="stat-info">
          <h3>{stats.average_rating || 0}</h3>
          <p>میانگین امتیاز</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📰</div>
        <div className="stat-info">
          <h3>{stats.total_news || 0}</h3>
          <p>اخبار منتشر شده</p>
        </div>
      </div>
    </div>
    <div className="recent-activity">
      <h2>فعالیت‌های اخیر</h2>
      <div className="activity-list">
        <div className="activity-item">
          <span className="activity-icon">📦</span>
          <span>محصول جدید اضافه شد</span>
          <span className="activity-time">2 ساعت پیش</span>
        </div>
        <div className="activity-item">
          <span className="activity-icon">💬</span>
          <span>نظر جدید دریافت شد</span>
          <span className="activity-time">5 ساعت پیش</span>
        </div>
        <div className="activity-item">
          <span className="activity-icon">🖼️</span>
          <span>تصویر جدید آپلود شد</span>
          <span className="activity-time">1 روز پیش</span>
        </div>
      </div>
    </div>
  </div>
)

// Products Tab Component
const ProductsTab = ({ products, onEdit, onCreate, onDelete }) => (
  <div className="products-tab">
    <div className="tab-header">
      <h1>📦 مدیریت محصولات</h1>
      <button className="primary-btn" onClick={onCreate}>
        ➕ محصول جدید
      </button>
    </div>
    <div className="products-grid">
      {products.length === 0 ? (
        <div className="empty-state">
          <p>هنوز محصولی اضافه نشده است</p>
        </div>
      ) : (
        products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img
                src={db.getMainImage(product.id)}
                alt={product.title}
                onError={(e) => {
                  e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
                }}
              />
              {product.is_featured && <span className="featured-badge">⭐ ویژه</span>}
            </div>
            <div className="product-info">
              <h3>{product.title}</h3>
              <p>{product.description.substring(0, 100)}...</p>
              <div className="product-stats">
                <span>🏷️ {db.getFeaturesByProduct(product.id).length} ویژگی</span>
                <span>📋 {db.getSpecificationsByProduct(product.id).length} مشخصه</span>
                <span>🖼️ {db.getImagesByProduct(product.id).length} تصویر</span>
              </div>
            </div>
            <div className="product-actions">
              <button className="edit-btn" onClick={() => onEdit(product)}>
                ✏️ ویرایش
              </button>
              <button className="delete-btn" onClick={() => onDelete(product.id)}>
                🗑️ حذف
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)

// Reviews Tab Component
const ReviewsTab = ({ onRefresh }) => {
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    setReviews(db.getReviews())
    setProducts(db.getProducts())
  }, [])

  const handleApproveReview = (id) => {
    db.updateReview(id, { approved: true })
    setReviews(db.getReviews())
    onRefresh()
  }

  const handleDeleteReview = (id) => {
    db.deleteReview(id)
    setReviews(db.getReviews())
    onRefresh()
  }

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.title : "محصول ناشناخته"
  }

  return (
    <div className="reviews-tab">
      <h1>💬 مدیریت نظرات</h1>
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className={`review-item ${review.approved ? "approved" : "pending"}`}>
            <div className="review-header">
              <h4>{review.author}</h4>
              <div className="review-rating">{"⭐".repeat(review.rating)}</div>
              <span className="review-product">{getProductName(review.product_id)}</span>
            </div>
            <div className="review-content">
              <p>{review.comment}</p>
            </div>
            <div className="review-meta">
              <span className="review-date">{new Date(review.created_at).toLocaleDateString("fa-IR")}</span>
              <span className={`review-status ${review.approved ? "approved" : "pending"}`}>
                {review.approved ? "✅ تایید شده" : "⏳ در انتظار تایید"}
              </span>
            </div>
            <div className="review-actions">
              {!review.approved && (
                <button className="approve-btn" onClick={() => handleApproveReview(review.id)}>
                  ✅ تایید
                </button>
              )}
              <button className="delete-btn" onClick={() => handleDeleteReview(review.id)}>
                🗑️ حذف
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="empty-state">
            <p>هنوز نظری ثبت نشده است</p>
          </div>
        )}
      </div>
    </div>
  )
}

// News Tab Component
const NewsTab = ({ onEdit, onCreate, onRefresh }) => {
  const [news, setNews] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    setNews(db.getNews())
  }, [])

  const handleDeleteNews = (id) => {
    if (window.confirm("آیا مطمئن هستید؟")) {
      db.deleteNews(id)
      setNews(db.getNews())
      onRefresh()
    }
  }

  const handleToggleFeatured = (id, currentStatus) => {
    // First, remove featured from all other news
    if (!currentStatus) {
      news.forEach(n => {
        if (n.is_featured) {
          db.updateNews(n.id, { is_featured: false })
        }
      })
    }
    
    // Then toggle this news
    db.updateNews(id, { is_featured: !currentStatus })
    setNews(db.getNews())
    onRefresh()
  }
  
  const handleBulkDelete = () => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید همه اخبار را حذف کنید؟")) {
      news.forEach(article => db.deleteNews(article.id))
      setNews([])
      onRefresh()
    }
  }
  
  const handleExportNews = () => {
    const dataStr = JSON.stringify(news, null, 2)
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'news-export.json'
    link.click()
  }
  
  // Filter and sort news
  let filteredNews = news
  
  if (searchTerm) {
    filteredNews = filteredNews.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }
  
  if (selectedCategory !== 'all') {
    filteredNews = filteredNews.filter(article => article.category === selectedCategory)
  }
  
  // Sort news
  switch (sortBy) {
    case 'newest':
      filteredNews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'oldest':
      filteredNews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'popular':
      filteredNews.sort((a, b) => (b.views || 0) - (a.views || 0))
      break
    case 'title':
      filteredNews.sort((a, b) => a.title.localeCompare(b.title))
      break
    default:
      break
  }
  
  const categories = [...new Set(news.map(article => article.category).filter(Boolean))]

  return (
    <div className="news-tab">
      <div className="tab-header">
        <h1>📰 مدیریت اخبار</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="danger-btn" onClick={handleBulkDelete}>
            🗑️ حذف همه
          </button>
          <button className="primary-btn" onClick={handleExportNews}>
            📤 خروجی JSON
          </button>
          <button className="primary-btn" onClick={onCreate}>
            ➕ خبر جدید
          </button>
        </div>
      </div>
      
      {/* Advanced Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px',
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div>
          <input
            type="text"
            placeholder="جستجو در اخبار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '15px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              color: '#fff',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '15px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              color: '#fff',
              fontSize: '16px'
            }}
          >
            <option value="all">همه دسته‌ها</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '15px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              color: '#fff',
              fontSize: '16px'
            }}
          >
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="popular">محبوب‌ترین</option>
            <option value="title">بر اساس عنوان</option>
          </select>
        </div>
      </div>
      
      {/* News Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '25px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4ecdc4', marginBottom: '10px' }}>
            {news.length}
          </div>
          <div style={{ color: '#c5c5c5' }}>کل اخبار</div>
        </div>
        
        <div style={{
          padding: '25px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffb527', marginBottom: '10px' }}>
            {news.filter(n => n.is_featured).length}
          </div>
          <div style={{ color: '#c5c5c5' }}>اخبار ویژه</div>
        </div>
        
        <div style={{
          padding: '25px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#13c8ff', marginBottom: '10px' }}>
            {news.reduce((sum, n) => sum + (n.views || 0), 0)}
          </div>
          <div style={{ color: '#c5c5c5' }}>کل بازدیدها</div>
        </div>
        
        <div style={{
          padding: '25px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '10px' }}>
            {categories.length}
          </div>
          <div style={{ color: '#c5c5c5' }}>دسته‌بندی‌ها</div>
        </div>
      </div>
      
      <div className="news-admin-grid">
        {filteredNews.length === 0 ? (
          <div className="empty-state">
            <p>{searchTerm || selectedCategory !== 'all' ? 'خبری با این فیلترها یافت نشد' : 'هنوز خبری اضافه نشده است'}</p>
          </div>
        ) : (
          filteredNews.map((article) => (
            <div key={article.id} className="news-admin-card">
              <div className="news-admin-image">
                <img
                  src={article.image || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"}
                  alt={article.title}
                  onError={(e) => {
                    e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
                  }}
                />
                {article.is_featured && <span className="featured-badge">⭐ ویژه</span>}
              </div>
              <div className="news-admin-info">
                <h3>{article.title}</h3>
                <p>{article.excerpt.substring(0, 100)}...</p>
                <div className="news-admin-meta">
                  <span>📅 {new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
                  <span>👁️ {article.views || 0} بازدید</span>
                  <span>📂 {article.category || 'عمومی'}</span>
                  <span>✍️ {article.author || 'فان تک'}</span>
                </div>
              </div>
              <div className="news-admin-actions">
                <button 
                  className={`featured-btn ${article.is_featured ? 'active' : ''}`}
                  onClick={() => handleToggleFeatured(article.id, article.is_featured)}
                  title={article.is_featured ? 'حذف از ویژه' : 'تنظیم به عنوان ویژه'}
                >
                  ⭐
                </button>
                <button className="edit-btn" onClick={() => onEdit(article)}>
                  ✏️ ویرایش
                </button>
                <button className="delete-btn" onClick={() => handleDeleteNews(article.id)}>
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Enhanced Product Modal Component
const ProductModal = ({ type, product, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    background_video: "",
    is_featured: false,
    features: [{ name: "", value: "", order: 1 }],
    specifications: [{ name: "", value: "", order: 1 }],
    images: [{ image: "", alt_text: "", order: 1, is_main: true }],
  })

  useEffect(() => {
    if (product && type === "edit-product") {
      const existingFeatures = db.getFeaturesByProduct(product.id)
      const existingSpecs = db.getSpecificationsByProduct(product.id)
      const existingImages = db.getImagesByProduct(product.id)

      setFormData({
        title: product.title || "",
        description: product.description || "",
        background_video: product.background_video || "",
        is_featured: product.is_featured || false,
        features: existingFeatures.length > 0 ? existingFeatures : [{ name: "", value: "", order: 1 }],
        specifications: existingSpecs.length > 0 ? existingSpecs : [{ name: "", value: "", order: 1 }],
        images: existingImages.length > 0 ? existingImages : [{ image: "", alt_text: "", order: 1, is_main: true }],
      })
    }
  }, [product, type])

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { value: "" }],
    })
  }

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({ ...formData, features: newFeatures })
  }

  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { name: "", value: "", order: formData.specifications.length + 1 }],
    })
  }

  const removeSpecification = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index)
    setFormData({ ...formData, specifications: newSpecs })
  }

  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { image: "", alt_text: "", order: formData.images.length + 1, is_main: false }],
    })
  }

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    let productId
    if (type === "create-product") {
      const newProduct = db.createProduct({
        title: formData.title,
        description: formData.description,
        background_video: formData.background_video,
        is_featured: formData.is_featured,
      })
      productId = newProduct.id
    } else if (type === "edit-product") {
      db.updateProduct(product.id, {
        title: formData.title,
        description: formData.description,
        background_video: formData.background_video,
        is_featured: formData.is_featured,
      })
      productId = product.id

      // Clear existing features, specs, and images
      db.deleteFeaturesByProduct(productId)
      db.deleteSpecificationsByProduct(productId)
      db.deleteImagesByProduct(productId)
    }

    // Add features
    formData.features.forEach((feature) => {
      if (feature.name && feature.value) {
        db.createFeature({
          ...feature,
          product_id: productId,
        })
      }
    })

    // Add specifications
    formData.specifications.forEach((spec) => {
      if (spec.name && spec.value) {
        db.createSpecification({
          ...spec,
          product_id: productId,
        })
      }
    })

    // Add images
    formData.images.forEach((image) => {
      if (image.image) {
        db.createImage({
          ...image,
          product_id: productId,
        })
      }
    })

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === "create-product" ? "➕ محصول جدید" : "✏️ ویرایش محصول"}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-sections">
            {/* Basic Info Section */}
            <div className="form-section">
              <h3>📝 اطلاعات پایه</h3>
              <div className="form-group">
                <label>عنوان محصول:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>توضیحات:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  محصول ویژه
                </label>
              </div>
            </div>

            {/* Media Section */}
            <div className="form-section">
              <h3>🎬 رسانه</h3>
              <div className="form-group">
                <label>URL ویدیو پس‌زمینه:</label>
                <input
                  type="url"
                  value={formData.background_video}
                  onChange={(e) => setFormData({ ...formData, background_video: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
                <small>لینک مستقیم ویدیو را وارد کنید</small>
              </div>
            </div>

            {/* Features Section */}
            <div className="form-section">
              <h3>⭐ ویژگی‌ها</h3>
              {formData.features.map((feature, index) => (
                <div key={index} className="feature-form-row">
                  <input
                    type="text"
                    placeholder="ویژگی محصول"
                    value={feature.value}
                    onChange={(e) => {
                      const newFeatures = [...formData.features]
                      newFeatures[index].value = e.target.value
                      setFormData({ ...formData, features: newFeatures })
                    }}
                  />
                  <button type="button" className="remove-btn" onClick={() => removeFeature(index)}>
                    🗑️
                  </button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addFeature}>
                ➕ افزودن ویژگی
              </button>
            </div>

            {/* Specifications Section */}
            <div className="form-section">
              <h3>📋 مشخصات فنی</h3>
              {formData.specifications.map((spec, index) => (
                <div key={index} className="dynamic-form-row">
                  <input
                    type="text"
                    placeholder="نام مشخصه"
                    value={spec.name}
                    onChange={(e) => {
                      const newSpecs = [...formData.specifications]
                      newSpecs[index].name = e.target.value
                      setFormData({ ...formData, specifications: newSpecs })
                    }}
                  />
                  <input
                    type="text"
                    placeholder="مقدار مشخصه"
                    value={spec.value}
                    onChange={(e) => {
                      const newSpecs = [...formData.specifications]
                      newSpecs[index].value = e.target.value
                      setFormData({ ...formData, specifications: newSpecs })
                    }}
                  />
                  <input
                    type="number"
                    placeholder="ترتیب"
                    value={spec.order}
                    onChange={(e) => {
                      const newSpecs = [...formData.specifications]
                      newSpecs[index].order = Number.parseInt(e.target.value)
                      setFormData({ ...formData, specifications: newSpecs })
                    }}
                  />
                  <button type="button" className="remove-btn" onClick={() => removeSpecification(index)}>
                    🗑️
                  </button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addSpecification}>
                ➕ افزودن مشخصه
              </button>
            </div>

            {/* Images Section */}
            <div className="form-section">
              <h3>🖼️ تصاویر</h3>
              {formData.images.map((image, index) => (
                <div key={index} className="image-form-row">
                  <input
                    type="url"
                    placeholder="URL تصویر"
                    value={image.image}
                    onChange={(e) => {
                      const newImages = [...formData.images]
                      newImages[index].image = e.target.value
                      setFormData({ ...formData, images: newImages })
                    }}
                  />
                  <input
                    type="text"
                    placeholder="متن جایگزین"
                    value={image.alt_text}
                    onChange={(e) => {
                      const newImages = [...formData.images]
                      newImages[index].alt_text = e.target.value
                      setFormData({ ...formData, images: newImages })
                    }}
                  />
                  <input
                    type="number"
                    placeholder="ترتیب"
                    value={image.order}
                    onChange={(e) => {
                      const newImages = [...formData.images]
                      newImages[index].order = Number.parseInt(e.target.value)
                      setFormData({ ...formData, images: newImages })
                    }}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={image.is_main}
                      onChange={(e) => {
                        const newImages = [...formData.images]
                        // If setting as main, unset others
                        if (e.target.checked) {
                          newImages.forEach((img, i) => {
                            img.is_main = i === index
                          })
                        } else {
                          newImages[index].is_main = false
                        }
                        setFormData({ ...formData, images: newImages })
                      }}
                    />
                    اصلی
                  </label>
                  <button type="button" className="remove-btn" onClick={() => removeImage(index)}>
                    🗑️
                  </button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addImage}>
                ➕ افزودن تصویر
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              لغو
            </button>
            <button type="submit" className="save-btn">
              💾 ذخیره
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// News Modal Component
const NewsModal = ({ type, news, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    image: "",
    is_featured: false,
  })

  useEffect(() => {
    if (news && type === "edit-news") {
      setFormData({
        title: news.title || "",
        excerpt: news.excerpt || "",
        content: news.content || "",
        author: news.author || "",
        category: news.category || "",
        image: news.image || "",
        is_featured: news.is_featured || false,
      })
    }
  }, [news, type])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (type === "create-news") {
      // If setting as featured, remove featured from others
      if (formData.is_featured) {
        const allNews = db.getNews()
        allNews.forEach(n => {
          if (n.is_featured) {
            db.updateNews(n.id, { is_featured: false })
          }
        })
      }
      
      db.createNews(formData)
    } else if (type === "edit-news") {
      // If setting as featured, remove featured from others
      if (formData.is_featured && !news.is_featured) {
        const allNews = db.getNews()
        allNews.forEach(n => {
          if (n.is_featured && n.id !== news.id) {
            db.updateNews(n.id, { is_featured: false })
          }
        })
      }
      
      db.updateNews(news.id, formData)
    }

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === "create-news" ? "➕ خبر جدید" : "✏️ ویرایش خبر"}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-sections">
            <div className="form-section">
              <h3>📝 اطلاعات خبر</h3>
              <div className="form-group">
                <label>عنوان خبر:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>خلاصه خبر:</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>متن کامل خبر:</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>📋 اطلاعات تکمیلی</h3>
              <div className="form-group">
                <label>نویسنده:</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="نام نویسنده (اختیاری)"
                />
              </div>
              <div className="form-group">
                <label>دسته‌بندی:</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="دسته‌بندی خبر"
                />
              </div>
              <div className="form-group">
                <label>تصویر خبر:</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  خبر ویژه (فقط یک خبر می‌تواند ویژه باشد)
                </label>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              لغو
            </button>
            <button type="submit" className="save-btn">
              💾 ذخیره
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminPanel