"use client"

import { useRef, useEffect, useState, useCallback, memo } from "react"
import "./Products.css"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"

// API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"

const apiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    console.log("📡 API Request:", url)

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("✅ API Response:", data)
      return data
    } catch (error) {
      console.error("💥 API Error:", error)
      throw error
    }
  },

  async getProducts(params = {}) {
    const searchParams = new URLSearchParams(params)
    return this.request(`/products/?${searchParams}`)
  },

  async getProduct(id) {
    return this.request(`/products/${id}/`)
  },
}

// Loading Component
const LoadingSpinner = memo(({ text = "در حال بارگذاری..." }) => (
  <div className="laser-products-loading-container">
    <div className="laser-products-loading-spinner">
      <div className="laser-products-spinner-ring"></div>
      <div className="laser-products-spinner-ring"></div>
      <div className="laser-products-spinner-ring"></div>
      <div className="laser-products-spinner-ring"></div>
    </div>
    <p className="laser-products-loading-text">{text}</p>
  </div>
))

// Error Component
const ErrorMessage = memo(({ error, onRetry }) => (
  <div className="laser-products-error-container">
    <div className="laser-products-error-icon">⚠️</div>
    <h3 className="laser-products-error-title">خطا در بارگذاری</h3>
    <p className="laser-products-error-message">{error}</p>
    {onRetry && (
      <button className="laser-products-retry-button" onClick={onRetry}>
        تلاش مجدد
      </button>
    )}
  </div>
))

// Easing functions for smooth animations
const easeOutBounce = (t) => {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  }
}

const easeOutElastic = (t) => {
  const c4 = (2 * Math.PI) / 3
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

const easeOutBack = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

// Modal Component
const ProductModal = memo(({ product, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const images = product.all_images || [product.main_image]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  // تبدیل title به name برای سازگاری با کد
  const productName = product.title || product.name

  return (
    <div className="laser-products-modal-overlay" onClick={onClose}>
      <div
        className="laser-products-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          "--modal-bg-gradient": `linear-gradient(135deg, #1a1a1a 0%, ${product.gradient?.match(/#[a-fA-F0-9]{6}/g)?.[0] || "#a435ff"}22 50%, #1a1a1a 100%)`,
        }}
      >
        <button className="laser-products-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="laser-products-modal-header">
          <h2
            className="laser-products-modal-title"
            style={{
              background: product.gradient || "linear-gradient(45deg, #ff006e, #a435ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {productName}
          </h2>
          <div className="laser-products-modal-price">{"⭐⭐⭐⭐⭐"}</div>
        </div>

        <div className="laser-products-modal-body">
          <div className="laser-products-modal-gallery">
            <div className="laser-products-gallery-main">
              <img
                src={images[currentImageIndex] || "/placeholder.svg?height=400&width=400"}
                alt={`${productName} - تصویر ${currentImageIndex + 1}`}
                className="laser-products-gallery-main-image"
              />
              {images.length > 1 && (
                <>
                  <button className="laser-products-gallery-nav prev" onClick={prevImage}>
                    ‹
                  </button>
                  <button className="laser-products-gallery-nav next" onClick={nextImage}>
                    ›
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="laser-products-gallery-thumbnails">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg?height=80&width=80"}
                    alt={`${productName} - تصویر کوچک ${index + 1}`}
                    className={`laser-products-gallery-thumbnail ${index === currentImageIndex ? "active" : ""}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="laser-products-modal-info">
            <div className="laser-products-modal-description">
              <h3>توضیحات محصول</h3>
              <p>{product.description}</p>
            </div>

            {product.specifications_dict && Object.keys(product.specifications_dict).length > 0 && (
              <div className="laser-products-modal-specifications">
                <h3>مشخصات فنی</h3>
                <div className="laser-products-specs-grid">
                  {Object.entries(product.specifications_dict).map(([key, value], index) => (
                    <div key={index} className="laser-products-spec-item">
                      <span className="laser-products-spec-label">{key}:</span>
                      <span className="laser-products-spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.features_list && product.features_list.length > 0 && (
              <div className="laser-products-modal-features">
                <h3>ویژگی‌های کلیدی</h3>
                <ul className="laser-products-modal-features-list">
                  {product.features_list.map((feature, index) => (
                    <li key={index} className="laser-products-modal-feature-item">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="laser-products-modal-actions">
              <button
                className="laser-products-btn-primary"
                style={{
                  background: product.gradient || "linear-gradient(45deg, #ff006e, #a435ff)",
                }}
              >
                سفارش محصول
              </button>
              <button className="laser-products-btn-secondary">مشاوره رایگان</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// 3D Model Component - بهینه‌سازی با memo
const OperatorModel = memo(({ isVisible, productIndex, modelPath }) => {
  const group = useRef()
  const elapsed = useRef(0)

  // استفاده از مدل پیش‌فرض اگر مدل از بک‌اند موجود نباشد
  const modelUrl = modelPath || "/operator.glb"

  const { scene, animations } = useGLTF(modelUrl)
  const { actions } = useAnimations(animations, group)
  const animationComplete = useRef(false)

  // Animation constants
  const ANIMATION_DURATION = 2.2
  const START_POS = new THREE.Vector3(-3, -4, 2.5)
  const FINAL_POS = new THREE.Vector3(0, -1.5, 0)
  const SPIRAL_ROTATIONS = 2.5

  useEffect(() => {
    if (actions && animations.length > 0) {
      const action = actions[animations[0].name]
      action.reset().fadeIn(0.5).play()
      action.setLoop(THREE.LoopRepeat, Number.POSITIVE_INFINITY)
    }
  }, [actions, animations])

  useEffect(() => {
    if (scene && isVisible) {
      scene.position.copy(START_POS)
      scene.scale.setScalar(0.2)
      elapsed.current = 0
      animationComplete.current = false
    }
  }, [scene, isVisible])

  useFrame((state, delta) => {
    if (!group.current || !isVisible) return

    if (elapsed.current < ANIMATION_DURATION) {
      elapsed.current += delta
      const progress = Math.min(elapsed.current / ANIMATION_DURATION, 1)

      const positionEase = easeOutBack(progress)
      const scaleEase = easeOutElastic(progress)
      const rotationProgress = progress

      const spiralIntensity = Math.sin(progress * Math.PI)
      const angle = progress * Math.PI * SPIRAL_ROTATIONS + productIndex * Math.PI * 0.5
      const radius = 2.5 * (1 - positionEase) * spiralIntensity

      const heightBoost = Math.sin(progress * Math.PI) * 1.5 * (1 - progress)

      const x = START_POS.x + (FINAL_POS.x - START_POS.x) * positionEase + radius * Math.cos(angle)
      const y = START_POS.y + (FINAL_POS.y - START_POS.y) * positionEase + heightBoost
      const z = START_POS.z + (FINAL_POS.z - START_POS.z) * positionEase + radius * Math.sin(angle)

      group.current.position.set(x, y, z)
      group.current.rotation.y = (1 - rotationProgress) * Math.PI * 3 + productIndex * Math.PI * 0.25
      group.current.rotation.x = Math.sin(progress * Math.PI * 2) * 0.2 * (1 - progress)

      const scale = 0.2 + (1 - 0.2) * scaleEase
      group.current.scale.setScalar(scale)

      if (progress === 1) {
        animationComplete.current = true
        group.current.position.copy(FINAL_POS)
        group.current.rotation.set(0, productIndex * Math.PI * 0.25, 0)
        group.current.scale.setScalar(1)
      }
    }
  })

  return <primitive object={scene} ref={group} />
})

// Hook for scroll animations - بهینه‌سازی با useCallback
const useScrollAnimation = () => {
  const [visibleSections, setVisibleSections] = useState(new Set())

  const observerCallback = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.dataset.section
        setVisibleSections((prev) => new Set([...prev, sectionId]))
      }
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "-50px",
    })

    // کمی تاخیر بذاریم تا DOM آماده بشه
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll("[data-scroll-section]")
      elements.forEach((el) => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [observerCallback])

  return visibleSections
}

// Product Section Component - بهینه‌سازی با memo
const ProductSection = memo(({ product, index, isVisible, onOpenModal }) => {
  // تبدیل title به name برای سازگاری با کد
  const productName = product.title || product.name

  return (
    <div
      className={`laser-products-product-section ${isVisible ? "visible" : ""}`}
      data-scroll-section
      data-section={`product-${product.id}`}
      style={{
        "--product-gradient": product.gradient || "linear-gradient(45deg, #ff006e, #a435ff)",
        "--bg-gradient": product.bg_gradient || "radial-gradient(circle at bottom right, #a435ff44, #0e0e0e 60%)",
        "--delay": `${index * 0.3}s`,
      }}
    >
      <div
        className="laser-products-product-3d"
        style={{ background: product.bg_gradient || "radial-gradient(circle at bottom right, #a435ff44, #0e0e0e 60%)" }}
      >
        <Canvas shadows camera={{ position: [0, 0.1, 0.5], fov: 95 }}>
          <ambientLight intensity={0.5} color={0x9999ff} />
          <hemisphereLight skyColor={0xaa00ff} groundColor={0xffffff} intensity={1} />
          <directionalLight position={[5, 10, 5]} intensity={2} color={0xffffff} castShadow />
          <spotLight position={[15, 10, 3]} intensity={110} angle={0.8} penumbra={0.8} color={0xaa00ff} castShadow />
          <pointLight position={[-3, 5, -3]} intensity={2} color={0xaa00ff} />
          <OperatorModel isVisible={isVisible} productIndex={index} modelPath={product.model_3d} />
        </Canvas>
      </div>

      <div className="laser-products-product-details">
        <h1 className="laser-products-product-name">{productName}</h1>
        <ul className="laser-products-product-features">
          {product.features_list && product.features_list.length > 0 ? (
            product.features_list.map((feature, idx) => (
              <li key={idx} className="laser-products-product-feature-item" style={{ "--item-delay": `${idx * 0.1}s` }}>
                {feature}
              </li>
            ))
          ) : (
            // نمایش توضیحات کوتاه اگر ویژگی موجود نباشد
            <li className="laser-products-product-feature-item">{product.description}</li>
          )}
        </ul>

        {/* دکمه اصلی */}
        <button className="laser-products-btn" onClick={() => onOpenModal(product)}>
          اطلاعات بیشتر
        </button>
      </div>
    </div>
  )
})

// Scroll Icon Component - بهینه‌سازی با memo
const ScrollIcon = memo(() => {
  return (
    <div className="laser-products-scroll-icon-container">
      <div className="laser-products-scroll-icon">
        <div className="laser-products-scroll-wheel"></div>
      </div>
      <span className="laser-products-scroll-text">اسکرول کنید</span>
    </div>
  )
})

// Main Products Component
const LaserProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const visibleSections = useScrollAnimation()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch products from API - بهینه‌سازی با useCallback
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getProducts()
      const productsData = response.results || response
      setProducts(productsData)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const scrollToFirstProduct = useCallback(() => {
    const firstProduct = document.querySelector(".laser-products-product-section")
    if (firstProduct) {
      firstProduct.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  const openModal = useCallback(async (product) => {
    try {
      // اگر محصول جزئیات کامل نداره، از API بگیر
      if (!product.specifications_dict || !product.features_list) {
        const fullProduct = await apiService.getProduct(product.id)
        setSelectedProduct(fullProduct)
      } else {
        setSelectedProduct(product)
      }
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error loading product details:", error)
      setSelectedProduct(product) // حداقل همین محصول رو نشون بده
      setIsModalOpen(true)
    }
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }, [])

  // نمایش لودینگ
  if (loading) {
    return (
      <div className="laser-products-container">
        <div className="laser-products-main-title-header">
          <h1 className="laser-products-main-title">محصولات</h1>
          <div className="laser-products-title-decoration">
            <div className="laser-products-decoration-line left"></div>
            <div className="laser-products-decoration-center">
              <div className="laser-products-decoration-dot"></div>
              <div className="laser-products-decoration-dot"></div>
              <div className="laser-products-decoration-dot"></div>
            </div>
            <div className="laser-products-decoration-line right"></div>
          </div>
          <p className="laser-products-title-description">
            مجموعه کاملی از محصولات لیزرتگ با تکنولوژی پیشرفته و طراحی منحصر به فرد
          </p>
        </div>
        <LoadingSpinner text="در حال بارگذاری محصولات..." />
      </div>
    )
  }

  // نمایش خطا
  if (error) {
    return (
      <div className="laser-products-container">
        <div className="laser-products-main-title-header">
          <h1 className="laser-products-main-title">محصولات</h1>
          <div className="laser-products-title-decoration">
            <div className="laser-products-decoration-line left"></div>
            <div className="laser-products-decoration-center">
              <div className="laser-products-decoration-dot"></div>
              <div className="laser-products-decoration-dot"></div>
              <div className="laser-products-decoration-dot"></div>
            </div>
            <div className="laser-products-decoration-line right"></div>
          </div>
        </div>
        <ErrorMessage error={error} onRetry={fetchProducts} />
      </div>
    )
  }

  // نمایش پیام اگر محصولی وجود نداشت
  if (!products || products.length === 0) {
    return (
      <div className="laser-products-container">
        <div className="laser-products-main-title-header">
          <h1 className="laser-products-main-title">محصولات</h1>
          <div className="laser-products-title-decoration">
            <div className="laser-products-decoration-line left"></div>
            <div className="laser-products-decoration-center">
              <div className="laser-products-decoration-dot"></div>
              <div className="laser-products-decoration-dot"></div>
              <div className="laser-products-decoration-dot"></div>
            </div>
            <div className="laser-products-decoration-line right"></div>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#ccc" }}>
          <h3>هنوز محصولی اضافه نشده است</h3>
          <p>لطفاً از پنل ادمین محصولات را اضافه کنید.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="laser-products-container">
      {/* Main Title Header */}
      <div className="laser-products-main-title-header">
        <h1 className="laser-products-main-title">محصولات</h1>
        <div className="laser-products-title-decoration">
          <div className="laser-products-decoration-line left"></div>
          <div className="laser-products-decoration-center">
            <div className="laser-products-decoration-dot"></div>
            <div className="laser-products-decoration-dot"></div>
            <div className="laser-products-decoration-dot"></div>
          </div>
          <div className="laser-products-decoration-line right"></div>
        </div>

        <p className="laser-products-title-description">
          مجموعه کاملی از محصولات لیزرتگ با تکنولوژی پیشرفته و طراحی منحصر به فرد
          <br />
          برای تجربه‌ای هیجان‌انگیز و متفاوت در بازی‌های تیمی و رقابتی
        </p>

        <div className="laser-products-scroll-indicator" onClick={scrollToFirstProduct}>
          <ScrollIcon />
        </div>
      </div>

      {/* Product Sections */}
      {products.map((product, index) => (
        <ProductSection
          key={product.id}
          product={product}
          index={index}
          isVisible={visibleSections.has(`product-${product.id}`)}
          onOpenModal={openModal}
        />
      ))}

      {/* Modal */}
      <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  )
}

export default LaserProducts
