import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductsPage from "./pages/ProductsPage.jsx";
import MoneyPlaceDashboard from "./pages/MoneyPlaceDashboard.jsx";
import ProductPage from "./pages/ProductsPage.jsx";
createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
        {/* <Route index element={<App />} /> */}
        <Route path="/" element={<MoneyPlaceDashboard />} />
        <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  </Router>
);
