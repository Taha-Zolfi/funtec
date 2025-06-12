import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import "./About.css";

const About = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const vantaRef = useRef(null);

  const [typedText, setTypedText] = useState("");
  const fullText =
    "سلام! ما اینجا هستیم تا تجربه‌های فوق‌العاده‌ای برای شما بسازیم. این بخش به معرفی کوتاهی از تیم و داستان ما اختصاص یافته است. امیدواریم لذت ببرید!";

  useEffect(() => {
    if (isInView) {
      controls.start("visible");

      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        setTypedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
        if (currentIndex === fullText.length) {
          clearInterval(typingInterval);
        }
      }, 40);

      return () => clearInterval(typingInterval);
    }
  }, [isInView, controls, fullText]);

  useEffect(() => {
    let effect = null;

    const loadVanta = async () => {
      const THREE = await import("three");
      const VANTA = await import("vanta/dist/vanta.clouds.min.js");

      effect = VANTA.default({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        backgroundColor: 0x000000,
        skyColor: 0x000000,
        cloudColor: 0x5f2b70,
        cloudShadowColor: 0x410f37,
        sunColor: 0xff7a00,
        sunGlareColor: 0xf013e3,
        speed: 1.0,
        clouds: 6
      });
    };

    loadVanta();

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  const borderVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.2, ease: "easeInOut" }
    }
  };

  const bgVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: {
      opacity: 1,
      backdropFilter: "blur(8px)",
      transition: { duration: 0.8, ease: "easeOut", delay: 1.2 }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 2.0 }
    }
  };

  return (
    <div className="About">
      <div className="about-canvas" ref={vantaRef} />
      <div className="about-svg-wrapper">
        <svg
          className="about-svg"
          width="100%"
          height="100%"
          viewBox="0 0 540 300"
          preserveAspectRatio="none"
        >
          <motion.rect
            x="1"
            y="1"
            width="538"
            height="298"
            rx="24"
            ry="24"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
            variants={borderVariants}
            initial="hidden"
            animate={controls}
          />
        </svg>
        <motion.div
          className="about-content"
          ref={ref}
          variants={bgVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h1 variants={titleVariants} initial="hidden" animate={controls}>
            درباره ما
          </motion.h1>
          <p className="about-typing">{typedText}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
