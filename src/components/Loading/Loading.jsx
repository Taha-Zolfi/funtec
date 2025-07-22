import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="logo-container">
        <div className="logo-wrapper">
          <img src="/logo.svg" alt="Logo" className="logo" />
          
          {/* Creative SVG Overlay Animations */}
          <svg className="logo-animation-overlay" viewBox="0 0 200 200">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent"/>
                <stop offset="30%" stopColor="rgba(19, 200, 255, 0.8)"/>
                <stop offset="70%" stopColor="rgba(255, 235, 0, 0.8)"/>
                <stop offset="100%" stopColor="transparent"/>
              </linearGradient>
              
              <radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(19, 200, 255, 0.6)"/>
                <stop offset="50%" stopColor="rgba(255, 235, 0, 0.3)"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
            </defs>
            
            {/* Scanning Lines */}
            <rect x="0" y="0" width="200" height="4" fill="url(#scanGradient)" className="scan-line scan-1"/>
            <rect x="0" y="50" width="200" height="2" fill="url(#scanGradient)" className="scan-line scan-2"/>
            <rect x="0" y="100" width="200" height="3" fill="url(#scanGradient)" className="scan-line scan-3"/>
            <rect x="0" y="150" width="200" height="2" fill="url(#scanGradient)" className="scan-line scan-4"/>
            
            {/* Morphing Circle */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(19, 200, 255, 0.4)" 
                    strokeWidth="1" strokeDasharray="20,10" className="morph-circle"/>
            
            {/* Pulse Effect */}
            <circle cx="100" cy="100" r="60" fill="url(#pulseGradient)" className="pulse-circle"/>
            
            {/* Corner Brackets */}
            <path d="M 30 30 L 30 50 M 30 30 L 50 30" stroke="#13c8ff" strokeWidth="2" className="bracket bracket-tl"/>
            <path d="M 170 30 L 170 50 M 170 30 L 150 30" stroke="#FFEB00" strokeWidth="2" className="bracket bracket-tr"/>
            <path d="M 30 170 L 30 150 M 30 170 L 50 170" stroke="#13c8ff" strokeWidth="2" className="bracket bracket-bl"/>
            <path d="M 170 170 L 170 150 M 170 170 L 150 170" stroke="#FFEB00" strokeWidth="2" className="bracket bracket-br"/>
            
            {/* Digital Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(19, 200, 255, 0.1)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#grid)" className="digital-grid"/>
          </svg>
          
          {/* Glitch Effect Layers */}
          <div className="glitch-layer glitch-1">
            <img src="/logo.svg" alt="Logo" />
          </div>
          <div className="glitch-layer glitch-2">
            <img src="/logo.svg" alt="Logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;