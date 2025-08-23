import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductsPage from "./pages/ProductsPage.jsx";
createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
        <Route index element={<App />} />
        <Route path="/products" element={<ProductsPage />} />
    </Routes>
  </Router>
);
