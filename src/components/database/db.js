// In-memory database با localStorage

class ReactDatabase {
  constructor() {
    this.tables = {
      products: "react_products",
      features: "react_features",
      specifications: "react_specifications",
      reviews: "react_reviews",
      images: "react_images",
    }
    this.initializeData()
  }


  // Initialize empty tables
  initializeData() {
    // Initialize empty arrays for all tables if they don't exist
    Object.values(this.tables).forEach((table) => {
      if (!localStorage.getItem(table)) {
        this.saveData(table, [])
      }
    })
    
    // Add sample data if no products exist
    if (this.getProducts().length === 0) {
      this.createSampleData()
    }
  }

  createSampleData() {
    // Sample products
    const sampleProducts = [
      {
        title: "تاب فلزی دو نفره",
        description: "تاب مقاوم و ایمن برای کودکان با ظرفیت دو نفر",
        is_featured: true,
        background_video: null
      },
      {
        title: "سرسره پلاستیکی",
        description: "سرسره رنگارنگ و شاد برای کودکان زیر 10 سال",
        is_featured: false,
        background_video: null
      },
      {
        title: "ژیمناستیک کودکان",
        description: "مجموعه کامل ژیمناستیک برای تقویت عضلات کودکان",
        is_featured: true,
        background_video: null
      }
    ]

    // Create products
    sampleProducts.forEach((productData, index) => {
      const product = this.createProduct(productData)
      
      // Add sample features
      const features = [
        { product_id: product.id, value: "مقاوم در برابر آب و هوا" },
        { product_id: product.id, value: "ایمنی بالا برای کودکان" },
        { product_id: product.id, value: "نصب آسان" },
        { product_id: product.id, value: "گارانتی 2 ساله" }
      ]
      
      features.forEach(feature => this.createFeature(feature))
      
      // Add sample specifications
      const specs = [
        { product_id: product.id, name: "ابعاد", value: "200x150x100 سانتی‌متر" },
        { product_id: product.id, name: "وزن", value: "25 کیلوگرم" },
        { product_id: product.id, name: "جنس", value: "فلز ضد زنگ" },
        { product_id: product.id, name: "رنگ", value: "آبی و قرمز" }
      ]
      
      specs.forEach(spec => this.createSpecification(spec))
      
      // Add sample images
      const images = [
        { 
          product_id: product.id, 
          image: "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
          is_main: true 
        },
        { 
          product_id: product.id, 
          image: "https://images.pexels.com/photos/1094072/pexels-photo-1094072.jpeg",
          is_main: false 
        }
      ]
      
      images.forEach(image => this.createImage(image))
      
      // Add sample reviews
      const reviews = [
        {
          product_id: product.id,
          reviewer_name: "احمد محمدی",
          rating: 5,
          comment: "محصول عالی و با کیفیت، کودکان خیلی راضی هستند",
          approved: true
        },
        {
          product_id: product.id,
          reviewer_name: "فاطمه احمدی",
          rating: 4,
          comment: "خوب است اما نصب کمی سخت بود",
          approved: true
        }
      ]
      
      reviews.forEach(review => this.createReview(review))
    })
  }

  // Generic CRUD operations
  saveData(table, data) {
    localStorage.setItem(table, JSON.stringify(data))
  }

  getData(table) {
    const data = localStorage.getItem(table)
    return data ? JSON.parse(data) : []
  }

  generateId(table) {
    const data = this.getData(table)
    return data.length > 0 ? Math.max(...data.map((item) => item.id)) + 1 : 1
  }

  // Products CRUD
  getProducts() {
    return this.getData(this.tables.products)
  }

  getProduct(id) {
    const products = this.getProducts()
    const product = products.find((p) => p.id === parseInt(id))
    if (!product) return null

    // Add related data
    product.features_list = this.getFeaturesByProduct(id).map((f) => f.value)
    product.specifications_dict = this.getSpecificationsByProduct(id).reduce((acc, spec) => {
      acc[spec.name] = spec.value
      return acc
    }, {})
    product.all_images = this.getImagesByProduct(id).map((img) => img.image)
    product.main_image = this.getMainImage(id)
    product.reviews = this.getReviewsByProduct(id)

    return product
  }

  getProductById(id) {
    return this.getProduct(id)
  }

  createProduct(productData) {
    const products = this.getProducts()
    const newProduct = {
      ...productData,
      id: this.generateId(this.tables.products),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    products.push(newProduct)
    this.saveData(this.tables.products, products)
    return newProduct
  }

  updateProduct(id, productData) {
    const products = this.getProducts()
    const index = products.findIndex((p) => p.id === Number.parseInt(id))
    if (index === -1) return null

    products[index] = {
      ...products[index],
      ...productData,
      updated_at: new Date().toISOString(),
    }
    this.saveData(this.tables.products, products)
    return products[index]
  }

  deleteProduct(id) {
    const products = this.getProducts()
    const filteredProducts = products.filter((p) => p.id !== Number.parseInt(id))
    this.saveData(this.tables.products, filteredProducts)

    // Delete related data
    this.deleteFeaturesByProduct(id)
    this.deleteSpecificationsByProduct(id)
    this.deleteImagesByProduct(id)
    this.deleteReviewsByProduct(id)

    return true
  }

  // Features CRUD
  getFeatures() {
    return this.getData(this.tables.features)
  }

  getFeaturesByProduct(productId) {
    return this.getFeatures().filter((f) => f.product_id === Number.parseInt(productId))
  }

  createFeature(featureData) {
    const features = this.getFeatures()
    const newFeature = {
      ...featureData,
      id: this.generateId(this.tables.features),
      product_id: Number.parseInt(featureData.product_id),
    }
    features.push(newFeature)
    this.saveData(this.tables.features, features)
    return newFeature
  }

  updateFeature(id, featureData) {
    const features = this.getFeatures()
    const index = features.findIndex((f) => f.id === Number.parseInt(id))
    if (index === -1) return null

    features[index] = { ...features[index], ...featureData }
    this.saveData(this.tables.features, features)
    return features[index]
  }

  deleteFeature(id) {
    const features = this.getFeatures()
    const filteredFeatures = features.filter((f) => f.id !== Number.parseInt(id))
    this.saveData(this.tables.features, filteredFeatures)
    return true
  }

  deleteFeaturesByProduct(productId) {
    const features = this.getFeatures()
    const filteredFeatures = features.filter((f) => f.product_id !== Number.parseInt(productId))
    this.saveData(this.tables.features, filteredFeatures)
  }

  // Specifications CRUD
  getSpecifications() {
    return this.getData(this.tables.specifications)
  }

  getSpecificationsByProduct(productId) {
    return this.getSpecifications().filter((s) => s.product_id === Number.parseInt(productId))
  }

  createSpecification(specData) {
    const specs = this.getSpecifications()
    const newSpec = {
      ...specData,
      id: this.generateId(this.tables.specifications),
      product_id: Number.parseInt(specData.product_id),
    }
    specs.push(newSpec)
    this.saveData(this.tables.specifications, specs)
    return newSpec
  }

  updateSpecification(id, specData) {
    const specs = this.getSpecifications()
    const index = specs.findIndex((s) => s.id === Number.parseInt(id))
    if (index === -1) return null

    specs[index] = { ...specs[index], ...specData }
    this.saveData(this.tables.specifications, specs)
    return specs[index]
  }

  deleteSpecification(id) {
    const specs = this.getSpecifications()
    const filteredSpecs = specs.filter((s) => s.id !== Number.parseInt(id))
    this.saveData(this.tables.specifications, filteredSpecs)
    return true
  }

  deleteSpecificationsByProduct(productId) {
    const specs = this.getSpecifications()
    const filteredSpecs = specs.filter((s) => s.product_id !== Number.parseInt(productId))
    this.saveData(this.tables.specifications, filteredSpecs)
  }

  // Images CRUD
  getImages() {
    return this.getData(this.tables.images)
  }

  getImagesByProduct(productId) {
    return this.getImages().filter((img) => img.product_id === Number.parseInt(productId))
  }

  getMainImage(productId) {
    const images = this.getImagesByProduct(productId)
    const mainImage = images.find((img) => img.is_main)
    return mainImage ? mainImage.image : images[0] ? images[0].image : "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
  }

  createImage(imageData) {
    const images = this.getImages()
    const newImage = {
      ...imageData,
      id: this.generateId(this.tables.images),
      product_id: Number.parseInt(imageData.product_id),
    }

    // If this is main image, unset others
    if (newImage.is_main) {
      images.forEach((img) => {
        if (img.product_id === newImage.product_id) {
          img.is_main = false
        }
      })
    }

    images.push(newImage)
    this.saveData(this.tables.images, images)
    return newImage
  }

  updateImage(id, imageData) {
    const images = this.getImages()
    const index = images.findIndex((img) => img.id === Number.parseInt(id))
    if (index === -1) return null

    // If setting as main, unset others
    if (imageData.is_main) {
      images.forEach((img) => {
        if (img.product_id === images[index].product_id && img.id !== Number.parseInt(id)) {
          img.is_main = false
        }
      })
    }

    images[index] = { ...images[index], ...imageData }
    this.saveData(this.tables.images, images)
    return images[index]
  }

  deleteImage(id) {
    const images = this.getImages()
    const filteredImages = images.filter((img) => img.id !== Number.parseInt(id))
    this.saveData(this.tables.images, filteredImages)
    return true
  }

  deleteImagesByProduct(productId) {
    const images = this.getImages()
    const filteredImages = images.filter((img) => img.product_id !== Number.parseInt(productId))
    this.saveData(this.tables.images, filteredImages)
  }

  // Reviews CRUD
  getReviews() {
    return this.getData(this.tables.reviews)
  }

  getReviewsByProduct(productId) {
    return this.getReviews().filter((r) => r.product_id === Number.parseInt(productId) && r.approved)
  }

  createReview(reviewData) {
    const reviews = this.getReviews()
    const newReview = {
      ...reviewData,
      id: this.generateId(this.tables.reviews),
      product_id: Number.parseInt(reviewData.product_id),
      approved: true, // Auto-approve for demo purposes
      created_at: new Date().toISOString(),
    }
    reviews.push(newReview)
    this.saveData(this.tables.reviews, reviews)
    return newReview
  }

  updateReview(id, reviewData) {
    const reviews = this.getReviews()
    const index = reviews.findIndex((r) => r.id === Number.parseInt(id))
    if (index === -1) return null

    reviews[index] = { ...reviews[index], ...reviewData }
    this.saveData(this.tables.reviews, reviews)
    return reviews[index]
  }

  deleteReview(id) {
    const reviews = this.getReviews()
    const filteredReviews = reviews.filter((r) => r.id !== Number.parseInt(id))
    this.saveData(this.tables.reviews, filteredReviews)
    return true
  }

  deleteReviewsByProduct(productId) {
    const reviews = this.getReviews()
    const filteredReviews = reviews.filter((r) => r.product_id !== Number.parseInt(productId))
    this.saveData(this.tables.reviews, filteredReviews)
  }

  // Stats
  getStats() {
    const products = this.getProducts()
    const reviews = this.getReviews().filter((r) => r.approved)
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

    return {
      total_products: products.length,
      featured_products: products.filter((p) => p.is_featured).length,
      total_reviews: reviews.length,
      average_rating: Math.round(avgRating * 10) / 10,
      products_with_images: this.getImages()
        .map((img) => img.product_id)
        .filter((id, index, arr) => arr.indexOf(id) === index).length,
    }
  }

  // Search
  searchProducts(query) {
    if (!query) return []

    const products = this.getProducts()
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()),
    )
  }

  // Clear all data
  clearAllData() {
    Object.values(this.tables).forEach((table) => {
      localStorage.removeItem(table)
    })
    this.initializeData()
  }
}

// Export singleton instance
export const db = new ReactDatabase()