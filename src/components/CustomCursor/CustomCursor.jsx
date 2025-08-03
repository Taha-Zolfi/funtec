import React, { useEffect, useRef, useState } from "react";

const lerp = (start, end, t) => start + (end - start) * t;

const CustomCursor = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const pulses = useRef([]);
  const animFrame = useRef(null);

  const [hovering, setHovering] = useState(false);
  const hoverProgress = useRef(0); // 0 to 1 for smooth transition

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", handleResize);

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Add pulse smoothly and spaced out
      if (pulses.current.length === 0 || (Date.now() - pulses.current[pulses.current.length - 1].time > 50)) {
        pulses.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: 10,
          maxRadius: 90,
          alpha: 0.35,
          time: Date.now(),
        });
        if (pulses.current.length > 6) pulses.current.shift();
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    const onHover = (e) => {
      if (e.target.tagName === "A" || e.target.tagName === "BUTTON") {
        setHovering(true);
      }
    };
    const onLeave = (e) => {
      if (e.target.tagName === "A" || e.target.tagName === "BUTTON") {
        setHovering(false);
      }
    };
    window.addEventListener("mouseover", onHover);
    window.addEventListener("mouseout", onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Smooth cursor follow with higher speed
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.3);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.3);

      // Smoothly interpolate hover progress
      hoverProgress.current += (hovering ? 1 : 0 - hoverProgress.current) * 0.1;
      hoverProgress.current = Math.min(Math.max(hoverProgress.current, 0), 1);

      // Calculate properties based on hoverProgress (smooth transition)
      const baseRadius = lerp(34, 46, hoverProgress.current);
      const shadowBlur = lerp(10, 24, hoverProgress.current);
      const pulseAlphaMultiplier = lerp(1, 1.5, hoverProgress.current);

      // Colors interpolate between #13c8ff and #FFEB00
      const interpolateColor = (progress) => {
        const c1 = { r: 19, g: 200, b: 255 }; // #13c8ff
        const c2 = { r: 255, g: 235, b: 0 };  // #FFEB00
        const r = Math.round(lerp(c1.r, c2.r, progress));
        const g = Math.round(lerp(c1.g, c2.g, progress));
        const b = Math.round(lerp(c1.b, c2.b, progress));
        return `rgb(${r},${g},${b})`;
      };

      const color = interpolateColor(hoverProgress.current);

      // Main circle (stroke)
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = shadowBlur;
      ctx.arc(pos.current.x, pos.current.y, baseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw pulses
      pulses.current.forEach((p, i) => {
        p.radius += 2.6;
        p.alpha -= 0.014 * pulseAlphaMultiplier;

        if (p.alpha <= 0) {
          pulses.current.splice(i, 1);
          return;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, p.radius * 0.5, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(${color.match(/\d+/g).join(",")},${p.alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(${color.match(/\d+/g).join(",")},0)`);

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = gradient;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 * hoverProgress.current;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      animFrame.current = requestAnimationFrame(draw);
    };

    animFrame.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onHover);
      window.removeEventListener("mouseout", onLeave);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [hovering]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        width: "100vw",
        height: "100vh",
        backgroundColor: "transparent",
        mixBlendMode: "screen",
      }}
    />
  );
};

export default CustomCursor;
