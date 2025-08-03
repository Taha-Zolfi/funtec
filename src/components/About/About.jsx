"use client"

import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react"
import * as THREE from "three"
import {
  Shield,
  Heart,
  ArrowRight,
  CheckCircle,
  Users,
  Trophy,
  Sparkles,
  Phone,
  Mail,
  Target,
  Clock,
  Play,
  Smile,
  Wrench,
  Palette,
  Settings,
  Globe,
  Award,
} from "lucide-react"
import "./About.css"


// Enhanced StatCard with advanced animations
const StatCard = memo(({ stat, index, isVisible }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    if (!isVisible) return

    let startTime = null
    const duration = 3000 + index * 400
    const targetValue = stat.value

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Advanced easing with elastic bounce
      const easeOutElastic = (t) => {
        const c4 = (2 * Math.PI) / 3
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
      }

      setDisplayValue(Math.floor(targetValue * easeOutElastic(progress)))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate)
    }, index * 200)

    return () => clearTimeout(timeoutId)
  }, [isVisible, stat.value, index])

  // Enhanced 3D tilt with magnetic attraction
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 6
      const rotateY = (centerX - x) / 6
      const scale = isHovered ? 1.08 : 1

      card.style.transform = `
        perspective(1200px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        translateZ(${isHovered ? 40 : 15}px)
        scale(${scale})
      `
    }

    const handleMouseLeave = () => {
      card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)"
      setIsHovered(false)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)
    card.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
      card.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [isHovered])

  return (
    <div
      ref={cardRef}
      className={`about-stat ${isHovered ? "hovered" : ""}`}
      style={{
        "--animation-delay": `${index * 0.15}s`,
        "--stat-color": stat.color || "#ffb527",
      }}
    >
      <span className="about-stat-number">
        {displayValue}
        {stat.suffix}
      </span>
      <span className="about-stat-label">{stat.label}</span>
    </div>
  )
})

// Enhanced FeatureCard with advanced interactions
const FeatureCard = memo(({ feature, index, isActive, onHover, onLeave }) => {
  const cardRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      setMousePosition({ x: x / rect.width, y: y / rect.height })

      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10

      card.style.transform = `
        perspective(1500px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        translateZ(${isActive ? 50 : 25}px)
        scale(${isActive ? 1.03 : 1})
      `
    }

    const handleMouseLeave = () => {
      card.style.transform = "perspective(1500px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)"
      setMousePosition({ x: 0.5, y: 0.5 })
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isActive])

  return (
    <div
      ref={cardRef}
      className={`about-feature-card ${isActive ? "active" : ""}`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
      style={{
        "--feature-color": feature.color,
        "--animation-delay": `${index * 0.2}s`,
        "--mouse-x": mousePosition.x,
        "--mouse-y": mousePosition.y,
      }}
    >
      <div className="about-feature-glow"></div>
      <div className="about-feature-spotlight"></div>
      <div className="about-feature-icon">{feature.icon}</div>
      <h3 className="about-feature-title">{feature.title}</h3>
      <p className="about-feature-description">{feature.description}</p>
    </div>
  )
})

// Enhanced ServiceItem with micro-interactions
const ServiceItem = memo(({ service, index }) => (
  <div className="about-service-item" style={{ "--animation-delay": `${index * 0.08}s` }}>
    <div className="about-service-icon">{service.icon}</div>
    <span className="about-service-text">{service.text}</span>
  </div>
))

// Enhanced TimelineItem with intersection observer
const TimelineItem = memo(({ milestone, index }) => {
  const [isVisible, setIsVisible] = useState(false)
  const itemRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (itemRef.current) {
      observer.observe(itemRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={itemRef}
      className={`about-timeline-item ${index % 2 === 0 ? "left" : "right"} ${isVisible ? "visible" : ""}`}
      style={{ "--animation-delay": `${index * 0.3}s` }}
    >
      <div className="about-timeline-content">
        <div className="about-timeline-year">{milestone.year}</div>
        <h3 className="about-timeline-title">{milestone.title}</h3>
        <p className="about-timeline-desc">{milestone.desc}</p>
      </div>
      <div className="about-timeline-dot" />
    </div>
  )
})

// Enhanced VisualCard with advanced effects
const VisualCard = memo(({ card, index }) => {
  const cardRef = useRef(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 8
      const rotateY = (centerX - x) / 8

      card.style.transform = `
        perspective(1200px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        translateZ(30px)
      `
    }

    const handleMouseLeave = () => {
      card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div ref={cardRef} className={`about-visual-card ${card.type}`} style={{ "--animation-delay": `${index * 0.12}s` }}>
      <div className="about-card-icon">
        <card.icon size={45} />
      </div>
      <h3>{card.title}</h3>
      <p>{card.desc}</p>
      <div className="about-card-shine"></div>
    </div>
  )
})

// Main About Component
const About = () => {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const observerRef = useRef(null)
  const featureTimerRef = useRef(null)

  // Enhanced static data
  const features = useMemo(
    () => [
      {
        icon: <Shield size={45} />,
        title: "ایمنی استاندارد جهانی",
        description:
          "تمام محصولات ما با استانداردهای بین‌المللی CE، EN1176 و ASTM تولید و تست می‌شوند تا بالاترین سطح ایمنی را برای کودکان فراهم کنند و خیال والدین را راحت نگه دارند",
        color: "#13c8ff",
      },
      {
        icon: <Palette size={45} />,
        title: "طراحی خلاقانه و منحصر به فرد",
        description:
          "تیم طراحان مجرب ما با استفاده از جدیدترین تکنولوژی‌ها و روش‌های نوآورانه، محیط‌های بازی جذاب و آموزشی برای رشد کودکان خلق می‌کنند",
        color: "#ffb527",
      },
      {
        icon: <Heart size={45} />,
        title: "کیفیت و دوام بالا",
        description:
          "استفاده از بهترین مواد اولیه مقاوم در برابر آب و هوا، اشعه UV و شرایط جوی سخت با گارانتی ۵ ساله کامل و خدمات پس از فروش",
        color: "#13c8ff",
      },
      {
        icon: <Users size={45} />,
        title: "خدمات جامع و حرفه‌ای",
        description:
          "از مشاوره اولیه و طراحی سه‌بعدی تا تولید، نصب و خدمات پس از فروش، در تمام مراحل پروژه همراه شما هستیم و پشتیبانی کامل ارائه می‌دهیم",
        color: "#ffb527",
      },
    ],
    [],
  )

  const services = useMemo(
    () => [
      { icon: <Play size={26} />, text: "طراحی و تولید سرسره‌های متنوع و ایمن" },
      { icon: <Smile size={26} />, text: "ساخت تاب‌ها و فنرهای استاندارد" },
      { icon: <Trophy size={26} />, text: "تجهیزات ورزشی و بازی کودکان" },
      { icon: <Shield size={26} />, text: "کفپوش‌های ضربه‌گیر EPDM رنگی" },
      { icon: <Target size={26} />, text: "خانه‌های بازی و کلبه‌های چوبی" },
      { icon: <Sparkles size={26} />, text: "مجموعه‌های ترکیبی و تماتیک بزرگ" },
      { icon: <Wrench size={26} />, text: "طراحی و اجرای پارک‌های شهری" },
      { icon: <Settings size={26} />, text: "تعمیر و نگهداری تجهیزات موجود" },
    ],
    [],
  )

  const milestones = useMemo(
    () => [
      {
        year: "2017",
        title: "تأسیس شرکت",
        desc: "شروع فعالیت با تیم ۵ نفره متخصص و پرانگیزه در زمینه تجهیزات شهربازی",
      },
      { year: "2019", title: "گسترش تولید", desc: "راه‌اندازی کارخانه ۲۰۰۰ متری با تجهیزات مدرن و خط تولید پیشرفته" },
      { year: "2021", title: "صادرات", desc: "شروع صادرات محصولات به کشورهای همسایه و گسترش بازار منطقه‌ای" },
      {
        year: "2023",
        title: "گواهینامه‌های بین‌المللی",
        desc: "دریافت استانداردهای CE و EN1176 از اروپا و تأیید کیفیت جهانی",
      },
      { year: "2024", title: "رهبری بازار", desc: "تبدیل شدن به بزرگ‌ترین تولیدکننده تجهیزات شهربازی منطقه" },
    ],
    [],
  )

  const statData = useMemo(
    () => [
      { value: 480, label: "پروژه موفق", suffix: "+", color: "#ffb527" },
      { value: 7, label: "سال تجربه", suffix: "+", color: "#13c8ff" },
      { value: 240, label: "مشتری راضی", suffix: "+", color: "#ffb527" },
      { value: 60, label: "شهر پوشش", suffix: "+", color: "#13c8ff" },
    ],
    [],
  )

  const visualCards = useMemo(
    () => [
      {
        icon: Trophy,
        title: "کیفیت تضمینی",
        desc: "گارانتی ۵ ساله روی تمام محصولات با پشتیبانی کامل و خدمات پس از فروش",
        type: "orange",
      },
      {
        icon: Clock,
        title: "تحویل سریع",
        desc: "نصب و راه‌اندازی در کمترین زمان ممکن با تیم متخصص و مجرب",
        type: "blue",
      },
      {
        icon: Shield,
        title: "ایمنی مطلق",
        desc: "استانداردهای CE، EN1176 و ASTM با تست‌های کامل کیفیت",
        type: "blue",
      },
      {
        icon: Globe,
        title: "پوشش سراسری",
        desc: "خدمات در سراسر کشور و منطقه با تیم‌های محلی متخصص",
        type: "orange",
      },
    ],
    [],
  )

  const ctaFeatures = useMemo(() => ["مشاوره رایگان", "بازدید محل", "طراحی سه‌بعدی", "گارانتی ۵ ساله"], [])

  // Enhanced scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = Math.min(scrollTop / docHeight, 1)
        setScrollProgress(progress)
        rafRef.current = null
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // Enhanced intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setIsVisible((prev) => {
          const updates = { ...prev }
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              updates[entry.target.id] = true
            }
          })
          return updates
        })
      },
      {
        threshold: [0.1, 0.3],
        rootMargin: "150px 0px",
      },
    )

    const elements = document.querySelectorAll("[data-section]")
    elements.forEach((el) => observerRef.current.observe(el))

    return () => {
      if (observerRef.current) {
        elements.forEach((el) => observerRef.current.unobserve(el))
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Component loaded state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Auto-rotate features with enhanced timing
  useEffect(() => {
    const startTimer = () => {
      featureTimerRef.current = setInterval(() => {
        setActiveFeature((prev) => (prev + 1) % features.length)
      }, 6000)
    }

    startTimer()
    return () => {
      if (featureTimerRef.current) {
        clearInterval(featureTimerRef.current)
      }
    }
  }, [features.length])

  // Optimized handlers
  const handleFeatureHover = useCallback((index) => {
    setActiveFeature(index)
    if (featureTimerRef.current) {
      clearInterval(featureTimerRef.current)
    }
  }, [])

  const handleFeatureLeave = useCallback(() => {
    if (featureTimerRef.current) {
      clearInterval(featureTimerRef.current)
    }
    featureTimerRef.current = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 6000)
  }, [features.length])

  return (
    <div
      className={`about-page ${isLoaded ? "loaded" : ""}`}
      id="about"
      ref={containerRef}
      style={{
        "--scroll-progress": scrollProgress,
      }}
    >
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress"></div>

      {/* Enhanced Three.js Background */}


      <div className="about-container">
        {/* Enhanced Hero Section */}
        <section id="hero" data-section className="about-hero">
          <div className={`about-fade-in ${isVisible.hero ? "about-animate" : ""}`}>
            <div className="about-hero-badge">
              <Award size={26} />
              <span>پیشرو در صنعت تجهیزات شهربازی</span>
            </div>

            <h1 className="about-hero-title">درباره فان تک</h1>

            <p className="about-hero-subtitle">
              ما در فان تک با بیش از ۷ سال تجربه، متخصص طراحی و تولید تجهیزات شهربازی ایمن و باکیفیت هستیم. هدف ما خلق
              فضاهای شاد، آموزشی و الهام‌بخش برای رشد و شکوفایی کودکان است.
            </p>
          </div>

          <div className={`about-stats about-fade-in ${isVisible.hero ? "about-animate" : ""}`}>
            {statData.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} isVisible={isVisible.hero} />
            ))}
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" data-section className="about-features">
          <div className={`about-fade-in ${isVisible.features ? "about-animate" : ""}`}>
            <div className="about-section-header">
              <h2 className="about-section-title">چرا فان تک؟</h2>
              <p className="about-section-subtitle">
                ویژگی‌هایی که ما را در صنعت تجهیزات شهربازی متمایز و پیشرو می‌کند و اعتماد هزاران مشتری را جلب کرده است
              </p>
            </div>

            <div className="about-features-grid">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  feature={feature}
                  index={index}
                  isActive={activeFeature === index}
                  onHover={handleFeatureHover}
                  onLeave={handleFeatureLeave}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Services Section */}
        <section id="services" data-section className="about-services">
          <div className={`about-fade-in ${isVisible.services ? "about-animate" : ""}`}>
            <div className="about-services-content">
              <div className="about-services-text">
                <h2>محصولات و خدمات ما</h2>
                <p>
                  مجموعه کاملی از تجهیزات شهربازی استاندارد برای تمام سنین، نیازها و بودجه‌ها. از طراحی تا نصب، همه چیز
                  با کیفیت بالا، ایمنی مطلق و زیبایی بی‌نظیر.
                </p>

                <div className="about-services-list">
                  {services.map((service, index) => (
                    <ServiceItem key={index} service={service} index={index} />
                  ))}
                </div>

                <a href="/products" className="about-btn-outline">
                  <span>مشاهده همه محصولات</span>
                  <ArrowRight size={24} />
                </a>
              </div>

              <div className="about-services-visual">
                <div className="about-visual-cards">
                  {visualCards.map((card, index) => (
                    <VisualCard key={index} card={card} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Timeline Section */}
        <section id="timeline" data-section className="about-timeline">
          <div className={`about-fade-in ${isVisible.timeline ? "about-animate" : ""}`}>
            <div className="about-section-header">
              <h2 className="about-section-title">مسیر رشد ما</h2>
              <p className="about-section-subtitle">
                نگاهی به مهم‌ترین دستاوردها و نقاط عطف در مسیر پیشرفت و توسعه فان تک از ابتدا تا امروز
              </p>
            </div>

            <div className="about-timeline-container">
              <div className="about-timeline-line" />

              {milestones.map((milestone, index) => (
                <TimelineItem key={index} milestone={milestone} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section id="cta" data-section className="about-cta">
          <div className={`about-fade-in ${isVisible.cta ? "about-animate" : ""}`}>
            <div className="about-cta-content">
              <h2 className="about-cta-title">آماده شروع پروژه هستید؟</h2>
              <p className="about-cta-description">
                با تیم متخصص فان تک تماس بگیرید و بهترین تجهیزات شهربازی را برای فضای خود انتخاب کنید. مشاوره رایگان،
                بازدید محل و طراحی سه‌بعدی کاملاً رایگان.
              </p>

              <div className="about-cta-actions">
                <a href="tel:09191771727" className="about-btn-primary">
                  <Phone size={28} />
                  <span>تماس فوری: 27-17-177-0919</span>
                </a>
                <a href="mailto:info@funtec.com" className="about-btn-secondary">
                  <Mail size={28} />
                  <span>درخواست مشاوره رایگان</span>
                </a>
              </div>

              <div className="about-cta-features">
                {ctaFeatures.map((feature, index) => (
                  <div key={index} className="about-cta-feature" style={{ "--animation-delay": `${index * 0.15}s` }}>
                    <CheckCircle size={22} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// Set display names for better debugging
StatCard.displayName = "StatCard"
FeatureCard.displayName = "FeatureCard"
ServiceItem.displayName = "ServiceItem"
TimelineItem.displayName = "TimelineItem"
VisualCard.displayName = "VisualCard"


export default About
