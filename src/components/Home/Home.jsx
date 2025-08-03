// FileName: Home.jsx

import { Suspense, useEffect, useState, useRef, useMemo, lazy } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async"; // این خط برای سئو اضافه شده است
import "./Home.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Points, PointMaterial } from "@react-three/drei";
import * as random from 'maath/random/dist/maath-random.esm';
const FerrisWheel = lazy(() => import("../FerrisWheel/FerrisWheel"));

// تمام کامپوننت‌های مربوط به ظاهر و انیمیشن شما بدون هیچ تغییری باقی می‌مانند
// ParticleField...
function ParticleField({ count = 3000, color = "#aaccff", size = 0.008 }) {
  const ref = useRef();
  const [sphere] = useState(() => random.inSphere(new Float32Array(count * 3), { radius: 10 }));
  const sizes = useRef(new Float32Array(count));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      sizes.current.set([size * (0.5 + Math.random() * 0.5)], i);
    }
  }, [count, size]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 40;
      ref.current.rotation.y -= delta / 50;
    }
  });

  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} scale={1}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={1}
      />
    </Points>
  );
}

// CreativeScene3D...
function CreativeScene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, background: 'linear-gradient(45deg, #040418, black, #181403ff)' }}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 5, 10]} intensity={0.6} color="#66aaff" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#ff88cc" />
      <directionalLight position={[5, 10, 5]} intensity={0.3} color="#ffffff" />
      <ParticleField count={2500} color="#aaccff" size={0.009} />
      <ParticleField count={1500} color="#ccddff" size={0.006} />
      <ParticleField count={1000} color="#ffdde0" size={0.004} />
    </Canvas>
  );
}


function Home() {
  // تمام state ها و hook های شما دست‌نخورده باقی می‌مانند
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const canvasRef = useRef()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500)
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.3,
      },
    },
  }), [])

  const itemVariants = useMemo(() => ({
    hidden: { y: 80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }), [])

  const mobileItemVariants = useMemo(() => ({
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
  }), [])


  const schemaData = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    "name": "فان تک",
    "description": "مرکز سرگرمی‌های هیجانی شامل لیزرتگ، لیزر ماز و اتاق‌های فرار ترسناک.",
    "url": "https://funtec.ir", // <-- آدرس کامل سایت خود را اینجا وارد کنید
    "telephone": "+989191771727", // <-- شماره تلفن اصلی خود را اینجا وارد کنید
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "میدان ولی عصر نبش خیابان فتحی شقاقی برج بلورین", // <-- آدرس دقیق شما
      "addressLocality": "تهران",
      "addressRegion": "تهران",
      "addressCountry": "IR"
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "بازی لیزرتگ"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "بازی لیزر ماز"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "اتاق وحشت (اتاق فرار)"
        }
      }
    ],
    "image": "https://funtec.ir/logo.png" // <-- لینک لوگوی خود را اینجا قرار دهید
  };

  return (
    <div className="home">
      {/* ================= بخش بهینه‌سازی سئو (SEO) ================= */}
      {/* این بخش هیچ تاثیر ظاهری روی صفحه شما ندارد و فقط برای گوگل است */}
      <Helmet>
        {/* تگ‌های اصلی */}
        <title>فان تک: مرکز لیزرتگ، لیزرماز و اتاق وحشت | رزرو آنلاین</title>
        <meta 
          name="description" 
          content="به دنبال نهایت هیجان و آدرنالین هستید؟ فان تک، بزرگترین مرکز بازی‌های گروهی لیزرتگ، لیزر ماز و ترسناک‌ترین اتاق‌های فرار. برای یک تجربه بی‌نظیر، آنلاین رزرو کنید." 
        />
        
        {/* تگ‌های Open Graph برای اشتراک‌گذاری در شبکه‌های اجتماعی */}
        <meta property="og:title" content="فان تک: تولید و فروش وسایل شهربازی ، لیزرتگ، لیزرماز و اتاق وحشت" />
        <meta property="og:description" content="تجربه هیجان واقعی با مدرن‌ترین بازی‌های گروهی." />
        <meta property="og:image" content={schemaData.image} />
        <meta property="og:url" content={schemaData.url} />
        <meta property="og:type" content="website" />

        {/* داده‌های ساختاریافته (Schema) برای درک عمیق گوگل */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      {/* ============================================================= */}


      {/* تمام کدهای مربوط به ظاهر و محتوای شما بدون هیچ تغییری در اینجا قرار دارد */}
      <CreativeScene3D className="bgg"/>

      <motion.div
        className="content-container"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
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

export default Home;