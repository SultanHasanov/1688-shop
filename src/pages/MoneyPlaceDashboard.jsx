import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Package,
  Store,
  Tag,
  BarChart3,
  Star,
  Download,
  Calculator,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import MarginCalculator from "../components/MarginCalculator";

const API_KEY = "XGXVQZX24QKQ3YGL";
const API_BASE = "https://api.moneyplace.io";

const MoneyPlaceDashboard = () => {
  const [activeTab, setActiveTab] = useState("statistics");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMp, setSelectedMp] = useState("wildberries");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedType, setSelectedType] = useState("fbo");
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [hoveredSearch, setHoveredSearch] = useState(null);

  const marketplaces = [
    { value: "wildberries", label: "Wildberries", color: "bg-purple-500" },
    { value: "ozon", label: "Ozon", color: "bg-blue-500" },
    { value: "ali", label: "AliExpress", color: "bg-orange-500" },
  ];

  const periods = [
    { value: "week", label: "Неделя" },
    { value: "two_weeks", label: "2 недели" },
    { value: "month", label: "Месяц" },
  ];

  const types = [
    { value: "fbo", label: "FBO (склад МП)" },
    { value: "fbs", label: "FBS (склад продавца)" },
  ];

  const tabs = [
    { id: "statistics", label: "Статистика", icon: BarChart3 },
    { id: "products", label: "Товары", icon: Package },
    { id: "categories", label: "Категории", icon: Tag },
    { id: "sellers", label: "Продавцы", icon: Store },
    { id: "brands", label: "Бренды", icon: Star },
    { id: "keywords", label: "Ключевые слова", icon: Search },
  ];

  // Функция для скачивания изображения
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

  const saveSearch = (query) => {
    if (!query.trim()) return;

    // Удаляем запрос если он уже есть, чтобы обновить позицию
    const filteredSearches = recentSearches.filter(
      (search) => search !== query
    );
    const updatedSearches = [query, ...filteredSearches].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem(
      "moneyplaceRecentSearches",
      JSON.stringify(updatedSearches)
    );
    localStorage.setItem("moneyplaceSearchQuery", query);
  };

  const removeRecentSearch = (searchToRemove, e) => {
    e.stopPropagation(); // Предотвращаем срабатывание клика по кнопке
    const updatedSearches = recentSearches.filter(
      (search) => search !== searchToRemove
    );
    setRecentSearches(updatedSearches);
    localStorage.setItem(
      "moneyplaceRecentSearches",
      JSON.stringify(updatedSearches)
    );
  };

  useEffect(() => {
    // Загружаем последние поиски из localStorage
    const savedSearches = localStorage.getItem("moneyplaceRecentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    // Загружаем последний поисковый запрос из localStorage
    const savedSearchQuery = localStorage.getItem("moneyplaceSearchQuery");
    if (savedSearchQuery) {
      setSearchQuery(savedSearchQuery);
    }

    // Загружаем другие настройки если нужно
    const savedSettings = localStorage.getItem("moneyplaceSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSelectedMp(settings.mp || selectedMp);
      setSelectedType(settings.type || selectedType);
      setSelectedPeriod(settings.period || selectedPeriod);
      setActiveTab(settings.tab || activeTab);
    }
  }, []);

  // Эффект для управления анимацией калькулятора
  useEffect(() => {
    if (showCalculator) {
      // Небольшая задержка для начала анимации
      setTimeout(() => setCalculatorVisible(true), 10);
    } else {
      setCalculatorVisible(false);
    }
  }, [showCalculator]);

  const makeApiRequest = async (endpoint, params = {}) => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams(params);
      const url = `${API_BASE}${endpoint}?${queryParams}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Token ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(`Ошибка API: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;

    const data = await makeApiRequest("/search/products", {
      "q[name][like]": searchQuery,
      "q[mp][in]": selectedMp,
      "per-page": 20,
      sort: "position",
      "q[position][more]": 0,
    });

    if (data) {
      setSearchResults(data);
    }
  };

  const searchByCategory = async () => {
    if (!searchQuery.trim()) return;

    const data = await makeApiRequest("/search/categories", {
      "q[name][like]": searchQuery,
      "q[mp][in]": selectedMp,
      "per-page": 20,
      sort: "-count",
      "q[count][more]": 0,
    });

    if (data) {
      setSearchResults(data);
    }
  };

  const searchSellers = async () => {
    if (!searchQuery.trim()) return;

    const data = await makeApiRequest("/search/sellers", {
      "q[name][like]": searchQuery,
      "q[mp][in]": selectedMp,
      "per-page": 20,
    });

    if (data) {
      setSearchResults(data);
    }
  };

  const searchBrands = async () => {
    if (!searchQuery.trim()) return;

    const data = await makeApiRequest("/search/brands", {
      "q[name][like]": searchQuery,
      "q[mp][in]": selectedMp,
      "per-page": 20,
    });

    if (data) {
      setSearchResults(data);
    }
  };

  const searchKeywords = async () => {
    if (!searchQuery.trim()) return;

    const data = await makeApiRequest("/search/keywords", {
      "q[name][like]": searchQuery,
      "q[mp][in]": selectedMp,
      "per-page": 20,
    });

    if (data) {
      setSearchResults(data);
    }
  };

  const getTopStatistics = async () => {
    const params = {
      mp: selectedMp,
      type: selectedType,
      period: selectedPeriod,
      sort: "-turnover",
      "per-page": 20,
    };

    // Добавляем параметр поиска, если он есть
    if (searchQuery.trim()) {
      params["q[name][like]"] = searchQuery;
    }

    const data = await makeApiRequest("/statistic/product", params);

    if (data) {
      setStatistics(data);
    }
  };

  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
    saveSearch(search);
    // Можно автоматически выполнить поиск
    setTimeout(() => handleSearch(), 100);
  };

  // Функция для очистки поиска
  const clearSearch = () => {
    setSearchQuery("");
    localStorage.removeItem("moneyplaceSearchQuery");
    setSearchResults([]);
    setStatistics(null);
  };

  const handleSearch = () => {
    saveSearch(searchQuery);
    switch (activeTab) {
      case "products":
        searchProducts();
        break;
      case "categories":
        searchByCategory();
        break;
      case "sellers":
        searchSellers();
        break;
      case "brands":
        searchBrands();
        break;
      case "keywords":
        searchKeywords();
        break;
      case "statistics":
        getTopStatistics(); // Теперь будет учитывать searchQuery
        break;
    }
  };

  // убираем вызов getTopStatistics из useEffect
  useEffect(() => {
    if (activeTab !== "statistics") return;
    // ничего не делаем автоматически
  }, [activeTab, selectedMp, selectedType, selectedPeriod, searchQuery]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("ru-RU").format(num);
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderProductCard = (product) => (
    <div
      key={product.id || product.sku}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
    >
      <div className="flex items-start space-x-4">
        {product.image && (
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <button
              onClick={() =>
                downloadImage(product.image, `product-${product.sku}.jpg`)
              }
              className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-lg rounded-tr-lg hover:bg-blue-700 transition-colors"
              title="Скачать изображение"
            >
              <Download className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span
              className={`px-2 py-1 rounded text-white text-xs ${
                marketplaces.find((mp) => mp.value === product.mp)?.color
              }`}
            >
              {marketplaces.find((mp) => mp.value === product.mp)?.label}
            </span>
            <span>SKU: {product.sku}</span>
            {product.position && <span>#{product.position}</span>}
          </div>

          {product.real_price && (
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-lg font-bold text-green-600">
                {formatPrice(product.real_price)}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price_with_discount)}
                </span>
              )}
              {product.discount > 0 && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                  -{product.discount}%
                </span>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4 text-sm">
            {product.rate && (
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{product.rate}</span>
              </div>
            )}
            {product.comments_count && (
              <span className="text-gray-600">
                {formatNumber(product.comments_count)} отзывов
              </span>
            )}
            {product.amount && (
              <span className="text-gray-600">
                {formatNumber(product.amount)} шт.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const openProductPage = (sku, mp) => {
    const urls = {
      wildberries: `https://www.wildberries.ru/catalog/${sku}/detail.aspx`,
      ozon: `https://www.ozon.ru/product/${sku}`,
      ali: `https://aliexpress.com/item/${sku}.html`,
    };
    window.open(urls[mp], "_blank");
  };

  const [selectedProduct, setSelectedProduct] = useState(null);

  const openProductModal = (item) => {
    setSelectedProduct(item);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const renderStatisticsTable = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 whitespace-nowrap">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Товар
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Выручка, ₽
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold">
                Наличие, шт
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold">
                Цена до скидки
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold">
                Комиссия МП, %
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold">
                Выкуп, %
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold">
                Продажи, шт
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statistics?.map(
              (item, index) =>
                console.log(item) || (
                  <tr
                    key={item.sku}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        {item.product?.image && (
                          <div className="relative">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <button
                              onClick={() =>
                                downloadImage(
                                  item.product.image,
                                  `product-${item.sku}.jpg`
                                )
                              }
                              className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-lg rounded-tr-lg hover:bg-blue-700 transition-colors"
                              title="Скачать изображение"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.id_product}`}
                            className="text-left hover:text-blue-600 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                              {item.product?.name}
                            </p>
                          </Link>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-white ${
                                marketplaces.find((mp) => mp.value === item.mp)
                                  ?.color
                              }`}
                            >
                              WB
                            </span>
                            <button
                              onClick={() => openProductPage(item.sku, item.mp)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {item.sku}
                            </button>
                            {item.product?.rate && (
                              <div className="flex items-center">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                <span>{item.product.rate}</span>
                                <span className="ml-1">
                                  {formatNumber(item.product.comments_count)}{" "}
                                  отзывов
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {formatNumber(item?.turnover || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {formatNumber(item?.last_amount || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        <div className=" text-gray-900">
                          {formatPrice(item.product?.real_price || 0)}
                        </div>
                        {item.product?.price_with_discount && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(item.product.price_with_discount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {formatNumber(item?.sell_commission || 0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {formatNumber(item?.buyout || 0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatNumber(item.Sales)}
                      </span>
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGenericCard = (item) => (
    <div
      key={item.id}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <span
          className={`px-2 py-1 rounded text-white text-xs ${
            marketplaces.find((mp) => mp.value === item.mp)?.color
          }`}
        >
          {marketplaces.find((mp) => mp.value === item.mp)?.label}
        </span>
      </div>

      {item.path && <p className="text-sm text-gray-600 mb-3">{item.path}</p>}

      <div className="flex items-center space-x-4 text-sm text-gray-600">
        {item.count && <span>{formatNumber(item.count)} товаров</span>}
        {item.code && <span>Код: {item.code}</span>}
        {item.requests && <span>{formatNumber(item.requests)} запросов</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <a
                    href="https://t.me/sult987"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 no-underline"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500">
                      <img
                        src="/my-photo.jpg"
                        alt="Telegram"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                      Мой Telegram
                    </span>
                  </a>
                </div>

              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedMp}
                onChange={(e) => setSelectedMp(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {marketplaces.map((mp) => (
                  <option key={mp.value} value={mp.value}>
                    {mp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
                <p className="text-gray-600">Аналитика маркетплейсов</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Поиск ${tabs
                    .find((t) => t.id === activeTab)
                    ?.label.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 150)} // Небольшая задержка для клика по элементам
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Дропдаун с последними поисками */}
                {isInputFocused &&
                  searchQuery === "" &&
                  recentSearches.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 transition-all duration-300 ease-in-out transform opacity-0 animate-fadeIn">
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">
                            Последние поиски:
                          </p>
                          {recentSearches.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecentSearches([]);
                                localStorage.removeItem(
                                  "moneyplaceRecentSearches"
                                );
                              }}
                              className="text-xs text-red-600 hover:text-red-800 transition-colors"
                            >
                              Очистить все
                            </button>
                          )}
                        </div>
                        {recentSearches.map((search, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between group hover:bg-gray-100 rounded transition-colors duration-150"
                            onMouseEnter={() => setHoveredSearch(search)}
                            onMouseLeave={() => setHoveredSearch(null)}
                          >
                            <button
                              onClick={() => handleRecentSearchClick(search)}
                              onMouseDown={(e) => e.preventDefault()}
                              className="flex-1 text-left px-2 py-2 text-sm text-gray-700 flex items-center"
                            >
                              <Search className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{search}</span>
                            </button>

                            <button
                              onClick={(e) => removeRecentSearch(search, e)}
                              className={`p-1 text-gray-400 hover:text-red-600 transition-colors ${
                                hoveredSearch === search
                                  ? "opacity-100"
                                  : "opacity-0"
                              } group-hover:opacity-100 mr-2`}
                              title="Удалить из истории"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {activeTab === "statistics" && (
              <>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {periods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              onClick={handleSearch}
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

            {activeTab === "statistics" && (
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Calculator className="w-5 h-5" />
                <span>
                  {showCalculator ? "Скрыть калькулятор" : "Калькулятор маржи"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Калькулятор с анимацией */}
        {activeTab === "statistics" && (
          <div
            className={`transition-all duration-500 ease-in-out ${
              showCalculator
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div
              className={`transform transition-transform duration-500 ${
                calculatorVisible ? "translate-y-0" : "-translate-y-4"
              }`}
            >
              <MarginCalculator />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {activeTab === "statistics" && statistics && (
            <div className="space-y-6">{renderStatisticsTable()}</div>
          )}

          {activeTab === "products" && searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((product) => renderProductCard(product))}
            </div>
          )}

          {["categories", "sellers", "brands", "keywords"].includes(
            activeTab
          ) &&
            searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((item) => renderGenericCard(item))}
              </div>
            )}
        </div>

        {/* Empty State */}
        {!loading && searchResults.length === 0 && !statistics && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Начните поиск
            </h3>
            <p className="text-gray-600">
              Введите запрос для поиска данных в выбранной категории
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MoneyPlaceDashboard;
