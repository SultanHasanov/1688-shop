import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  Download,
  Copy,
  Check,
  ExternalLink,
  Star,
  BarChart3,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import PriceTracker from "../components/PriceTracker";

const API_KEY = import.meta.env.VITE_API_KEY;
const API_BASE = import.meta.env.VITE_API_BASE;

const ArticleSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMp, setSelectedMp] = useState("wildberries");
  const [error, setError] = useState("");
  const [copiedItemId, setCopiedItemId] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  const marketplaces = [
    { value: "wildberries", label: "Wildberries", color: "bg-purple-500" },
    { value: "ozon", label: "Ozon", color: "bg-blue-500" },
    { value: "ali", label: "AliExpress", color: "bg-orange-500" },
  ];

  useEffect(() => {
    const savedSearches = localStorage.getItem("articleRecentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const saveSearch = (query) => {
    if (!query.trim()) return;
    const filteredSearches = recentSearches.filter(search => search !== query);
    const updatedSearches = [query, ...filteredSearches].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("articleRecentSearches", JSON.stringify(updatedSearches));
  };

const makeApiRequest = async (params = {}) => {
  setLoading(true);
  setError("");

  try {
    const queryParams = new URLSearchParams(params);
    const url = `${API_BASE}/v1/product?${queryParams}`;

    console.log("Making request to:", url); // Для отладки

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status); // Для отладки

    if (!response.ok) {
      // Получим больше информации об ошибке
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Если не удалось распарсить JSON с ошибкой
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Response data:", data); // Для отладки
    return data;
  } catch (err) {
    console.error("API Error:", err);
    setError(`Ошибка API: ${err.message}`);
    return null;
  } finally {
    setLoading(false);
  }
};

  const searchByArticle = async () => {
    if (!searchQuery.trim()) return;

    const data = await makeApiRequest({
      "q[sku][equal]": searchQuery,
      "q[mp][equal]": selectedMp,
      "expand": "category,seller,brand"
    });

    if (data) {
      setSearchResults(data);
      saveSearch(searchQuery);
    }
  };

  const copyToClipboard = (text, itemId) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedItemId(itemId);
        setTimeout(() => setCopiedItemId(null), 2000);
      })
      .catch((err) => {
        console.error("Ошибка при копировании:", err);
      });
  };

  const downloadImage = async (imageUrl, fileName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "image.jpg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ошибка при скачивании изображения:", error);
    }
  };

  const openProductPage = (sku, mp) => {
    const urls = {
      wildberries: `https://www.wildberries.ru/catalog/${sku}/detail.aspx`,
      ozon: `https://www.ozon.ru/product/${sku}`,
      ali: `https://aliexpress.com/item/${sku}.html`,
    };
    window.open(urls[mp], "_blank");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("ru-RU").format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Назад
              </Link>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Поиск по артикулу</h1>
                <p className="text-gray-600">Точный поиск товаров по артикулу маркетплейса</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Артикул товара
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Введите артикул товара..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchByArticle()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Маркетплейс
              </label>
              <select
                value={selectedMp}
                onChange={(e) => setSelectedMp(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {marketplaces.map((mp) => (
                  <option key={mp.value} value={mp.value}>
                    {mp.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="self-end">
              <button
                onClick={searchByArticle}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>{loading ? "Поиск..." : "Найти"}</span>
              </button>
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Недавние поиски:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(search);
                      searchByArticle();
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
<PriceTracker/>
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 gap-6">
          {searchResults.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Product Image */}
                {product.image && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => downloadImage(product.image, `product-${product.sku}.jpg`)}
                      className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-lg rounded-tr-lg hover:bg-blue-700 transition-colors"
                      title="Скачать изображение"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`px-2 py-1 rounded text-white text-sm ${marketplaces.find((mp) => mp.value === product.mp)?.color}`}>
                      {marketplaces.find((mp) => mp.value === product.mp)?.label}
                    </span>
                    <span className="text-sm text-gray-600">Артикул: {product.sku}</span>
                    {product.position && (
                      <span className="text-sm text-gray-600">Позиция: #{product.position}</span>
                    )}
                  </div>

                  {/* Price Information */}
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(product.real_price)}
                    </span>
                    {product.discount > 0 && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(product.price_with_discount)}
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                          -{product.discount}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatNumber(product.amount)}
                      </div>
                      <div className="text-sm text-gray-600">Наличие</div>
                    </div>
                    {product.rate && (
                      <div className="text-center">
                        <div className="flex items-center justify-center text-2xl font-bold text-gray-900">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          {product.rate}
                        </div>
                        <div className="text-sm text-gray-600">Рейтинг</div>
                      </div>
                    )}
                    {product.comments_count && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatNumber(product.comments_count)}
                        </div>
                        <div className="text-sm text-gray-600">Отзывы</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatNumber(product.store_amount)}
                      </div>
                      <div className="text-sm text-gray-600">FBS склад</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => openProductPage(product.sku, product.mp)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Открыть на маркетплейсе</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(product.sku, product.sku)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      {copiedItemId === product.sku ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>Копировать артикул</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(product.category || product.brand || product.seller) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Дополнительная информация</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {product.category && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Категория</h4>
                        <p className="text-gray-900">{product.category.name}</p>
                      </div>
                    )}
                    {product.brand && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Бренд</h4>
                        <p className="text-gray-900">{product.brand.name}</p>
                      </div>
                    )}
                    {product.seller && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Продавец</h4>
                        <p className="text-gray-900">{product.seller.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && searchResults.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Товар не найден
            </h3>
            <p className="text-gray-600">
              Попробуйте другой артикул или выберите другой маркетплейс
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && searchResults.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <BarChart3 className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-medium text-gray-900 mb-4">
              Поиск по артикулу
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Введите артикул товара для получения подробной информации. 
              Система найдет товар на выбранном маркетплейсе и покажет 
              актуальные данные о цене, наличии, рейтинге и других параметрах.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">Примеры артикулов:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="text-center">Wildberries: 6583968</div>
                <div className="text-center">OZON: 165117234</div>
                <div className="text-center">AliExpress: 329456789</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArticleSearch;