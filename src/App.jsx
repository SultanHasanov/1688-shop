// App.js - Main entry point for the React application
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css'; // We'll define styles in a separate CSS file

const API_BASE_URL = 'https://api.moneyplace.io';
const API_TOKEN = 'XGXVQZX24QKQ3YGL'; // Your provided API key

// Helper function to make API requests
const apiRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
      },
      params,
    });
    // Handle pagination headers if needed
    const headers = response.headers;
    const pagination = {
      currentPage: parseInt(headers['x-pagination-current-page']) || 1,
      pageCount: parseInt(headers['x-pagination-page-count']) || 1,
      perPage: parseInt(headers['x-pagination-per-page']) || 20,
      totalCount: parseInt(headers['x-pagination-total-count']) || 0,
    };
    return { data: response.data, pagination };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Main Search Page Component (similar to the first screenshot)
const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mp, setMp] = useState('wildberries'); // Default marketplace
  const [type, setType] = useState('fbo'); // fbo or fbs
  const [period, setPeriod] = useState('week'); // week, two_weeks, month
  const [sort, setSort] = useState('-turnover'); // Sorting option
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, pageCount: 1, totalCount: 0 });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Use statistic/product for top products with filters
      const params = {
        mp,
        type,
        period,
        sort,
        'per-page': perPage,
        page,
      };
      if (searchQuery) {
        params['q[name][like]'] = searchQuery;
      }
      const { data, pagination } = await apiRequest('/statistic/product', params);
      setResults(data);
      setPagination(pagination);
    } catch (error) {
      alert('Error fetching data. Check console for details.');
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    handleSearch();
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Поиск: Футболка</h1> {/* Dynamic title based on search */}
        <nav>
          <button className={type === 'fbo' ? 'active' : ''} onClick={() => setType('fbo')}>FBO</button>
          <button className={type === 'fbs' ? 'active' : ''} onClick={() => setType('fbs')}>FBS</button>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Неделя</option>
            <option value="two_weeks">Две недели</option>
            <option value="month">Месяц</option>
          </select>
          <select value={mp} onChange={(e) => setMp(e.target.value)}>
            <option value="wildberries">Wildberries</option>
            <option value="ozon">Ozon</option>
            <option value="ali">AliExpress</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="-turnover">По обороту DESC</option>
            <option value="turnover">По обороту ASC</option>
            <option value="-Sales">По продажам DESC</option>
            <option value="Sales">По продажам ASC</option>
          </select>
          <input
            type="text"
            placeholder="Поиск по названию"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Поиск</button>
        </nav>
      </header>
      <main>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Тип товара</th>
                <th>Бренд</th>
                <th>Продавец</th>
                <th>Выручка, P</th>
                <th>Продажи, шт</th>
                <th>Остаток, шт</th>
                <th>Цена до скидки</th>
                <th>Спрос</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={item.product?.id}>
                  <td>
                    <Link to={`/product/${item.product?.id}`}>
                      <img src={item.product?.image} alt={item.product?.name} className="product-img" />
                      {item.product?.name}
                    </Link>
                  </td>
                  <td>{item.product?.sku}</td>
                  <td>{item.brand?.name}</td>
                  <td>{item.seller?.name}</td>
                  <td>{item.turnover}</td>
                  <td>{item.Sales}</td>
                  <td>{item.product?.amount}</td>
                  <td>{item.product?.price_with_discount}</td>
                  <td>
                    {/* Placeholder for demand graph */}
                    <div className="demand-graph">Graph</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>Предыдущая</button>
          <span>Страница {pagination.currentPage} из {pagination.pageCount}</span>
          <button disabled={page === pagination.pageCount} onClick={() => handlePageChange(page + 1)}>Следующая</button>
        </div>
      </main>
    </div>
  );
};

// Product Details Page Component (similar to the second screenshot)
const ProductDetailsPage = () => {
  const { id } = useParams(); // Use useParams for React Router v6
  const productId = id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await apiRequest(`/v1/product/${productId}?expand=category,seller,brand`);
        setProduct(data);
      } catch (error) {
        alert('Error fetching product details.');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <p>Загрузка...</p>;
  if (!product) return <p>Товар не найден.</p>;

  return (
    <div className="product-details">
      <img src={product.image} alt={product.name} className="large-img" />
      <h1>{product.name}</h1>
      <ul>
        <li>Артикул: {product.sku}</li>
        <li>Основная категория: {product.category?.name}</li>
        <li>Бренд: {product.brand?.name}</li>
        <li>Продавец: {product.seller?.name}</li>
        <li>Цена до скидки: {product.price_with_discount}</li>
        <li>Цена продажи: {product.real_price}</li>
        <li>Выкуп: {product.discount}%</li>
        <li>Комиссия МП: {/* Fetch from stats if needed */}</li>
      </ul>
      {/* Add more sections for charts, stats, etc. */}
      <button>Помочь с продвижением</button>
    </div>
  );
};

// Main App Component with Routing
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/product/:id" element={<ProductDetailsPage />} />
    </Routes>
  </Router>
);

export default App;