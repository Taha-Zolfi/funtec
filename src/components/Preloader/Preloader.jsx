// src/components/Preloader.jsx
import React from 'react';

import './Preloader.css';


export default function Preloader() {
  return (
    <div className="preloader">
      <div className="preloader-content">
        <h1>در حال بارگذاری...</h1>
      </div>
    </div>
  );
}

