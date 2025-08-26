// ProductPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Eye, ArrowLeft, Download, Copy, Check } from "lucide-react";

const API_KEY = "XGXVQZX24QKQ3YGL";
const API_BASE = "https://api.moneyplace.io";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("ru-RU").format(num || 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const downloadImage = async () => {
    if (!product?.image) return;
    
    try {
      const response = await fetch(product.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Создаем имя файла из названия товара или артикула
      const fileName = `${product.name || product.sku || 'product'}.jpg`
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]/gi, '_')
        .replace(/_+/g, '_');
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка при скачивании изображения:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Ошибка при копировании:', err);
    });
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE}/v1/product/${id}?expand=category,seller,brand`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(`Ошибка загрузки товара: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Товар не найден</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Детали товара</h1>
          </div>
        </div>
      </header>

      {/* Product Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              {product.image && (
                <div className="relative group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full rounded-2xl object-cover"
                  />
                  <button
                    onClick={downloadImage}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Скачать изображение"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>
                <div className="flex items-center space-x-4 mb-4">
                  {product.rate && (
                    <div className="flex items-center">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-lg font-semibold">
                        {product.rate}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {formatNumber(product.comments_count)} отзывов
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded bg-purple-500 text-white text-sm">
                      Артикул: {product.sku}
                    </span>
                    <button
                      onClick={() => copyToClipboard(product.sku)}
                      className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                      title="Копировать артикул"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-gray-600 text-sm">
                    Появилась в сервисе:{" "}
                    {new Date().toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Основная категория</span>
                  <span className="text-blue-600 font-medium">
                    {product.category?.name || "Футболки и топы"}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Бренд</span>
                  <span className="text-blue-600 font-medium">
                    {product.brand?.name || "BIBITI@HOP"}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Продавец</span>
                  <span className="text-blue-600 font-medium">
                    {product.seller?.name || "ИП Красильников Э.А."}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Цена до скидки</span>
                  <span className="font-bold text-lg">
                    {formatPrice(product.price_with_discount)}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Цена продажи</span>
                  <span className="font-bold text-lg text-green-600">
                    {formatPrice(product.real_price)}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    Выкуп
                    <Eye className="w-4 h-4 ml-1 text-gray-400" />
                  </span>
                  <span className="font-bold">
                    {product.discount?.toFixed(1) || 97.5}%
                  </span>
                </div>

                <div className="flex justify-between py-3">
                  <span className="text-gray-600 flex items-center">
                    Комиссия МП
                    <Eye className="w-4 h-4 ml-1 text-gray-400" />
                  </span>
                  <span className="font-bold">{29.5}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Statistics Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Статистика продаж
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(product.amount || 48)}
                </div>
                <div className="text-sm text-gray-600">Наличие, шт</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(Math.round((product.amount || 48) * 0.975))}
                </div>
                <div className="text-sm text-gray-600">Продано, шт</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(
                    (product.real_price || 2824) *
                      Math.round((product.amount || 48) * 0.975)
                  )}
                </div>
                <div className="text-sm text-gray-600">Общая выручка</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{97.5}%</div>
                <div className="text-sm text-gray-600">Выкуп</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;