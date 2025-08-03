import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Box, Torus } from '@react-three/drei';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaTelegram, FaInstagram, FaPhone, FaHeadset, FaUsers, FaBuilding } from 'react-icons/fa';
import * as random from 'maath/random/dist/maath-random.esm';
import './Contact.css';
import logo from './logo.png'

// New Creative 3D Elements - Floating Geometric Shapes
function FloatingGeometry({ position, color, scale = 1, shape = 'box' }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.4;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3 + position[1]) * 0.2;
    }
  });

  const GeometryComponent = shape === 'torus' ? Torus : Box;
  const args = shape === 'torus' ? [0.8, 0.3, 16, 32] : [1, 1, 1];

  return (
    <GeometryComponent ref={meshRef} position={position} scale={scale} args={args}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.7}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </GeometryComponent>
  );
}

// Enhanced Particle System with Multiple Layers
function ParticleField({ count = 1500, color = "#ffb527" }) {
  const ref = useRef();
  const [sphere] = useMemo(() => [random.inSphere(new Float32Array(count), { radius: 6 })], [count]);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 25;
      ref.current.rotation.y -= delta / 30;
    }
  });
  
  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.006}
        sizeAttenuation={true}
        depthWrite={false}
        blending={2}
      />
    </Points>
  );
}

// Completely New 3D Scene with Creative Elements
function CreativeScene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 8, 8]} intensity={1.2} color="#ffb527" />
      <pointLight position={[-8, -8, -8]} intensity={0.8} color="#13c8ff" />
      <spotLight position={[0, 10, 0]} intensity={0.6} color="#ffffff" angle={0.3} />
      
      {/* Multiple Particle Layers */}
      <ParticleField count={1200} color="#ffb527" />
      <ParticleField count={800} color="#13c8ff" />
      
      {/* Creative Floating Geometries */}
      <FloatingGeometry position={[-4, 1, -3]} color="#ffb527" scale={0.6} shape="box" />
      <FloatingGeometry position={[4, -1, -4]} color="#13c8ff" scale={0.8} shape="torus" />
      <FloatingGeometry position={[0, 3, -5]} color="#ffb527" scale={0.4} shape="box" />
      <FloatingGeometry position={[-3, -2, -2]} color="#13c8ff" scale={0.7} shape="torus" />
      <FloatingGeometry position={[3, 2, -3]} color="#ffb527" scale={0.5} shape="box" />
      <FloatingGeometry position={[-1, -3, -4]} color="#13c8ff" scale={0.6} shape="torus" />
    </Canvas>
  );
}

// Department Contact Component
const DepartmentContact = ({ title, phones, icon: Icon, delay = 0 }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay
      }
    }
  };

  return (
    <motion.div className="department-section" variants={itemVariants}>
      <div className="department-header">
        <div className="department-icon-wrapper">
          <Icon className="department-icon" />
        </div>
        <h3 className="department-title">{title}</h3>
      </div>
      <div className="department-phones">
        {phones.map((phone, index) => (
          <motion.a
            key={index}
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="phone-link"
            whileHover={{ scale: 1.02, x: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <FaPhone className="phone-icon-small" />
            <span>{phone}</span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

const Contact = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.3
      }
    }
  };

  // Enhanced sparkles with better distribution
  const sparkles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 4,
    size: Math.random() * 0.5 + 0.5,
  }));

  return (
    <div id="contact" className="contact-container">
      {/* New Creative 3D Background */}
      <CreativeScene3D />

      {/* Enhanced floating sparkles */}
      <div className="sparkles-container">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="sparkle"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              animationDelay: `${sparkle.delay}s`,
              transform: `scale(${sparkle.size})`,
            }}
          />
        ))}
      </div>

      <motion.div 
        className="contact-wrapper"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h1 className="contact-title" variants={titleVariants}>
          تماس با ما
        </motion.h1>

        <motion.div className="contact-content" variants={itemVariants}>
          {/* Department Contacts */}
          <div className="departments-grid">
            <DepartmentContact
              title="واحد بازاریابی و فروش"
              phones={["021 33 49 99 01", "021 33 49 99 02"]}
              icon={FaBuilding}
              delay={0.1}
            />
            
            <DepartmentContact
              title="تیم فروش"
              phones={["0919 177 17 27", "0910 910 13 80"]}
              icon={FaUsers}
              delay={0.2}
            />
            
            <DepartmentContact
              title="خدمات پس از فروش"
              phones={["021 33 47 73 55", "0990 477 277 1"]}
              icon={FaHeadset}
              delay={0.3}
            />
          </div>

          {/* Social Media */}
          <motion.div className="social-grid" variants={itemVariants}>
            <motion.a 
              href="https://instagram.com/Funtec.co"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item social-item"
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <div className="icon-wrapper instagram-wrapper">
                <FaInstagram className="icon instagram-icon" />
              </div>
              <span style={{ flex: 1, textAlign: 'right' }}>@Funtec.co</span>
              <div className="item-glow instagram-glow"></div>
            </motion.a>

            <motion.a 
              href="https://t.me/funtec_co"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item social-item"
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <div className="icon-wrapper telegram-wrapper">
                <FaTelegram className="icon telegram-icon" />
              </div>
              <span style={{ flex: 1, textAlign: 'right' }}>@funtec_co</span>
              <div className="item-glow telegram-glow"></div>
            </motion.a>
          </motion.div>

          {/* Address sections */}
          <motion.div 
            className="address-section"
            variants={itemVariants}
          >
            <div className="address-card">
              <div className="icon-wrapper location-wrapper">
                <FaMapMarkerAlt className="icon location-icon" />
              </div>
              <div className="address-content">
                <h3 className="address-title">آدرس دفتر مرکزی</h3>
                <span className="address-text">تهران میدان ولی عصر نبش خیابان فتحی شقاقی برج بلورین</span>
              </div>
              <div className="item-glow location-glow"></div>
            </div>
          </motion.div>

          <motion.div 
            className="address-section"
            variants={itemVariants}
          >
            <div className="address-card">
              <div className="icon-wrapper location-wrapper">
                <FaMapMarkerAlt className="icon location-icon" />
              </div>
              <div className="address-content">
                <h3 className="address-title">آدرس دفتر خدمات</h3>
                <span className="address-text">تهران میدان آقا نور مجتمع تجاری پاساژ اطمینان ایرانیان</span>
              </div>
              <div className="item-glow location-glow"></div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="contact-footer"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <img src={logo} alt="فان تک" className="contact-logo" />
          <span>فان تک - پیشگام در صنعت شهربازی</span>
        </motion.div>

        <motion.p className="copyright desktop-only" variants={itemVariants}>
          © 1404 فان تک. تمامی حقوق محفوظ است.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Contact;