// Home.jsx
import React from 'react';
import './Home.css';
import FerrisWheel from '../FerrisWheel/FerrisWheel';
import { Canvas } from '@react-three/fiber';

const Home = () => {
  return (
    <div className="home">
      <div className="pattern"></div>

      <div className="content-container">
        <div className="main animate-stagger">
          <h1 className="title animate-fadeInFromRight">فان تک</h1>

          <p className="subtitle animate-fadeInFromRight">
            ساخت و فروش دستگاه های <span className="hightlight">شهر بازی </span>
          </p>

          <div className="home-buttons">
            <button className="home-btn gallery animate-fadeInFromRight">گالری محصولات</button>
            <button className="home-btn contact animate-fadeInFromRight">ارتباط با ما</button>
          </div>
        </div>

        <div className="ferris-wheel-container animate-fadeInFromRight">
          <Canvas shadows camera={{ position: [0, 0, 2.1], fov: 90 }}>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[5, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.8} />
            <FerrisWheel />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Home;
