import { Suspense, useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import "./Home.css"
import FerrisWheel from "../FerrisWheel/FerrisWheel"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"

function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const canvasRef = useRef()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500)

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  const mobileItemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="home">
      {/* Background Elements */}
      <div className="pattern"></div>
      <div className="floating-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      {/* Main Content */}
      <motion.div
        className="content-container"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Text Content */}
        <motion.div className="main" variants={isMobile ? mobileItemVariants : itemVariants}>
          <motion.h1 className="h-title" variants={isMobile ? mobileItemVariants : itemVariants}>
            فان تک
          </motion.h1>

          <motion.p className="subtitle" variants={isMobile ? mobileItemVariants : itemVariants}>
            ساخت و فروش دستگاه های شهربازی
          </motion.p>

          <motion.div className="home-buttons" variants={isMobile ? mobileItemVariants : itemVariants}>
            <a href="/products">
              <motion.button
                className="home-btn gallery"
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                مشاهده محصولات
              </motion.button>
            </a>
            <a href="#contact">
              <motion.button
                className="home-btn contact"
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                تماس با ما
              </motion.button>
            </a>
          </motion.div>
        </motion.div>

        {/* 3D Canvas - Render only when loaded and not mobile */}
        {isLoaded && !isMobile && (
          <motion.div className="ferris-wheel-container" variants={itemVariants}>
            <Canvas
              ref={canvasRef}
              camera={{ position: [0, 0, 2.5], fov: 75 }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
              }}
              dpr={[1, 2]}
              performance={{ min: 0.5 }}
            >
              <Suspense fallback={null}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ffb527" />
                <pointLight position={[10, 10, 10]} intensity={0.3} color="#13c8ff" />
                <Environment preset="night" />
                <group scale={[1.4, 1.4, 1.4]} position={[0.5, 1, 0]}>
                  <FerrisWheel />
                </group>
              </Suspense>
            </Canvas>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Home
