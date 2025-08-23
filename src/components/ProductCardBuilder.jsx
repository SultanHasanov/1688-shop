import { Edit3, Save, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const ProductCardBuilder = ({productCard, setProductCard, galleryImages, parsedData}) => {
  const scrollContainerRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageSelect = (img, isChecked) => {
    if (isChecked) {
      setProductCard((prev) => ({
        ...prev,
        images: [...prev.images, img],
      }));
    } else {
      setProductCard((prev) => ({
        ...prev,
        images: prev.images.filter(
          (selectedImg) => selectedImg.src !== img.src
        ),
      }));
    }
  };

   const saveProductCard = async () => {
      try {
        // Проверяем, что есть хотя бы одно изображение
        if (productCard.images.length === 0) {
          alert("Добавьте хотя бы одно изображение");
          return;
        }
  
        // Обрезаем "_sum.jpg" у всех картинок
        const cleanedImages = productCard.images.map((img) => ({
          ...img,
          src: img.src.replace("_sum.jpg", ""),
        }));
  
        const response = await fetch(
          "https://3b7c09cbacf69a0e.mokky.dev/products",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...productCard,
              images: cleanedImages, // сохраняем уже обработанные ссылки
              createdAt: new Date().toISOString(),
              rating: Math.random() * 2 + 3, // Рандомный рейтинг 3-5
              isNew: Math.random() > 0.5, // Случайный бейдж новинки
            }),
          }
        );
  
        if (response.ok) {
          alert("Карточка товара успешно сохранена!");
          // Очищаем карточку после сохранения
          setProductCard({
            title: "",
            price: "",
            images: [],
            sizes: [],
            colors: [],
            description: "",
          });
        } else {
          alert("Ошибка при сохранении карточки");
        }
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка при сохранении карточки");
      }
    };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mt-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg md:text-xl font-semibold">
          Конструктор карточки товара
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={saveProductCard}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
          >
            <Save className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="space-y-3 md:space-y-4">
          <h3 className="font-semibold text-sm md:text-base">
            Редактирование
          </h3>

          <div>
            <label className="block text-xs md:text-sm font-medium mb-2">
              Изображения из галереи ({productCard.images.length} выбрано)
            </label>
            <div 
              ref={scrollContainerRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 md:max-h-72 overflow-y-auto"
            >
              {galleryImages.map((img, index) => (
                <label 
                  key={index} 
                  className="relative group cursor-pointer"
                  onClick={(e) => {
                    // Предотвращаем стандартное поведение
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const isCurrentlySelected = productCard.images.some(
                      (selectedImg) => selectedImg.src === img.src
                    );
                    handleImageSelect(img, !isCurrentlySelected);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={productCard.images.some(
                      (selectedImg) => selectedImg.src === img.src
                    )}
                    onChange={(e) => {
                      // Останавливаем всплытие события
                      e.stopPropagation();
                    }}
                    className="absolute opacity-0 w-0 h-0"
                    readOnly // Делаем input управляемым только через React
                  />
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-20 md:h-24 object-cover rounded border group-hover:border-blue-400 transition-colors"
                  />
                  <div
                    className={`absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      productCard.images.some(
                        (selectedImg) => selectedImg.src === img.src
                      )
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300 group-hover:border-blue-400"
                    }`}
                  >
                    {productCard.images.some(
                      (selectedImg) => selectedImg.src === img.src
                    ) && (
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Остальной код без изменений */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-2">
                Название товара
              </label>
              <input
                value={productCard.title}
                onChange={(e) =>
                  setProductCard((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded text-sm md:text-base"
                placeholder="Введите название"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium mb-2">
                Цена
              </label>
              <input
                value={productCard.price}
                onChange={(e) =>
                  setProductCard((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded text-sm md:text-base"
                placeholder="Введите цену"
              />
            </div>
          </div>

          {productCard.sizes.length > 0 && (
            <div>
              <label className="block text-xs md:text-sm font-medium mb-2">
                Размеры
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {productCard.sizes.map((size, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="text-xs md:text-sm">
                      {size.size}
                    </span>
                    <button
                      onClick={() =>
                        setProductCard((prev) => ({
                          ...prev,
                          sizes: prev.sizes.filter((_, i) => i !== index),
                        }))
                      }
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      title="Удалить размер"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              onClick={() =>
                setProductCard({
                  title: "",
                  price: "",
                  images: [],
                  sizes: [],
                  colors: [],
                  description: "",
                })
              }
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded text-sm md:text-base hover:bg-gray-200 transition-colors"
            >
              Очистить
            </button>
            <button
              onClick={() =>
                parsedData &&
                setProductCard((prev) => ({
                  ...prev,
                  title: parsedData.title || "",
                  price:
                    parsedData.priceInRubles?.display ||
                    parsedData.price ||
                    "",
                  sizes: parsedData.sizes || [],
                  colors: parsedData.colors || [],
                }))
              }
              className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded text-sm md:text-base hover:bg-blue-200 transition-colors"
            >
              Заполнить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardBuilder 