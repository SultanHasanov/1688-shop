import React, { useState, useEffect } from "react";
import { Image, DollarSign, Ruler } from "lucide-react";

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://3b7c09cbacf69a0e.mokky.dev/products");
        if (!response.ok) {
          throw new Error("Ошибка загрузки каталога");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Каталог товаров</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col"
            >
              {/* Изображение (первое) */}
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.target.src = "placeholder.jpg")} // fallback если нужно
                />
              )}

              {/* Название */}
              <div className="p-4 flex-grow">
                <h3 className="font-semibold text-lg mb-2">{product.title}</h3>

                {/* Размеры с ценами */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Ruler className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">Размеры и цены</span>
                    </div>
                    <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                      {product.sizes.map((size, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 rounded p-2 min-w-[100px] flex-shrink-0"
                        >
                          <div className="font-medium">{size.size}</div>
                          <div className="text-blue-600 font-semibold flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{size.priceRub.toFixed(2)} ₽</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center text-gray-500 mt-8">Каталог пуст</div>
        )}
      </div>
    </div>
  );
};

export { Catalog };