import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home/Home";
import Nav from "./components/Nav/Nav";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import Products from "./components/Products/Products";
import ProductDetail from "./components/Products/ProductDetail";
import AdminPanel from "./components/Admin/AdminPanel";
import Loading from "./components/Loading/Loading";
import CustomCursor from "./components/CustomCursor/CustomCursor";
import News from "./components/News/News";
import NewsDetail from "./components/News/NewsDetails";
import Services from "./components/services/services";


const MainPage = () => {
  return (
    <>
      <Nav />
      <Home />
      <About />
      <Contact />
    </>
  );
};
const ProductPage = () => {
  return (
    <>
      <Nav />
        <Products />

    </>
  );
};

const NewsPage = () => {
  return (
    <>
      <Nav />
        <News />

    </>
  );
};

const ServicesPage = () => {
  return (
    <>
      <Nav />
        <Services />

    </>
  );
};


// تابع برای تشخیص موبایل
const isMobileDevice = () => {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="App">
        {!isMobileDevice() && <CustomCursor />}
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/services" element={<ServicesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
