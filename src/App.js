import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Home from "./components/Home/Home";
import Nav from "./components/Nav/Nav";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import Products from "./components/Products/Products";
import ProductDetail from "./components/Products/ProductDetail";
import AdminPanel from "./components/Admin/AdminPanel";
import Loading from "./components/Loading/Loading";

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

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for Three.js and other resources
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds to match your loading time

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;