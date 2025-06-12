import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"
import "./App.css"
import Home from "./components/Home/Home"
import Nav from "./components/Nav/Nav"
import About from "./components/About/About"
import Contact from "./components/Contact/Contact"
import Products from "./components/Products/Products"

// کامپوننت اصلی برای صفحه اصلی که شامل Home, About و Contact است
const MainPage = () => {
  const navigate = useNavigate()

  // تابع برای هدایت به صفحه محصولات
  const goToProducts = () => {
    navigate("/products")
  }

  return (
    <>
      <Nav />
      <Home onProductsClick={goToProducts} />
      <About />
      <Contact />
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
