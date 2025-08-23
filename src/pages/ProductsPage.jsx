import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Heart,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  ShoppingCart,
  X,
  Trash2,
  MessageCircle,
  Instagram,
  Send,
  Check,
} from "lucide-react";
import productsData from "./products_local.json";
// Простой компонент Select без внешних библиотек
const SimpleSelect = ({ defaultValue, options, onChange, style }) => {
  return (
    <select
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
      style={style}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Модальное окно корзины с оформлением заказа
const CartModal = ({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeFromCart,
  onSubmitOrder,
}) => {
  const [contactMethod, setContactMethod] = useState("phone");
  const [contactValue, setContactValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Закрытие модального окна при клике на backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalPrice = Math.round(
    Object.values(cart).reduce((sum, item) => {
      // Если price уже число - используем как есть, если строка - преобразуем
      const itemPrice =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(" ₽", "").replace(/\s/g, ""))
          : item.price;

      return sum + itemPrice * item.quantity;
    }, 0)
  );

  console.log(totalPrice, cart);

  const contactOptions = [
    {
      value: "phone",
      label: "Телефон",
      icon: Phone,
      placeholder: "+7 (999) 123-45-67",
    },
    {
      value: "telegram",
      label: "Telegram",
      icon: Send,
      placeholder: "@username или +7 (999) 123-45-67",
    },
    {
      value: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      placeholder: "+7 (999) 123-45-67",
    },
    {
      value: "instagram",
      label: "Instagram",
      icon: Instagram,
      placeholder: "@username",
    },
  ];

  const selectedOption = contactOptions.find(
    (opt) => opt.value === contactMethod
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactValue.trim()) return;

    setIsSubmitting(true);
    await onSubmitOrder(contactMethod, contactValue);
    setIsSubmitting(false);
    setContactValue("");
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Корзина</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Корзина пуста</p>
            </div>
          ) : (
            <>
              {/* Товары в корзине */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize?.size}`}
                    className="flex items-center space-x-3 border-b pb-3"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {item.title}
                      </h3>
                      {item.selectedSize && (
                        <p className="text-xs text-gray-500">
                          Размер: {item.selectedSize.size}
                        </p>
                      )}
                      <p className="text-green-600 font-semibold">
                        {item.price}
                      </p>

                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.selectedSize?.size,
                              item.quantity - 1
                            )
                          }
                          className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.selectedSize?.size,
                              item.quantity + 1
                            )
                          }
                          className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.selectedSize?.size)
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Итоговая сумма */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Итого:</span>
                  <span className="font-bold text-2xl text-green-600">
                    {totalPrice} ₽
                  </span>
                </div>
              </div>

              {/* Форма оформления заказа */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Оформление заказа</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Способ связи:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {contactOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setContactMethod(option.value)}
                          className={`p-2 border rounded-lg flex flex-col items-center space-y-1 transition-colors ${
                            contactMethod === option.value
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-xs">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Ваш {selectedOption?.label}:
                  </label>
                  <input
                    type="text"
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={selectedOption?.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !contactValue.trim()}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Отправляем заказ..."
                    : `Оформить заказ на ${totalPrice} ₽`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Модальное окно успешного заказа
const SuccessModal = ({ isOpen, onClose, contactMethod }) => {
  const contactLabels = {
    phone: "телефону",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
  };

  if (!isOpen) return null;

  // Закрытие модального окна при клике на backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Заказ оформлен!</h2>
        <p className="text-gray-600 mb-4">
          Ваш заказ отправлен администратору. Мы свяжемся с вами через{" "}
          {contactLabels[contactMethod]} в ближайшее время.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};

// Основной компонент страницы товаров
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastContactMethod, setLastContactMethod] = useState("phone");
 const [mobileDisplayMode, setMobileDisplayMode] = useState('single'); // 'single' или 'double'
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Функция для работы с localStorage (в реальном приложении)
  // ВАЖНО: localStorage не работает в Claude.ai, используем состояние React
  const saveCartToStorage = (cartData) => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartData));
    } catch (error) {
      console.error("Ошибка сохранения корзины в localStorage:", error);
    }
  };

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Ошибка загрузки корзины из localStorage:", error);
      return [];
    }
  };

  const clearCartFromStorage = () => {
    try {
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Ошибка очистки корзины в localStorage:", error);
    }
  };

  // Загрузка корзины при инициализации
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    setCart(savedCart);
  }, []);

  // Сохранение корзины при изменении
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // Загрузка карточек из API
  useEffect(() => {
    try {
      setLoading(true);

      // Используем локальный JSON
      const data = productsData;
      console.log(data);

      setProducts(data);

      // Инициализируем индексы изображений для каждого товара
      const indexes = {};
      const initialSizes = {};
      data.forEach((product, index) => {
        indexes[index] = 0;
        if (product.sizes && product.sizes.length > 0) {
          initialSizes[index] = product.sizes[0];
        }
      });

      setCurrentImageIndexes(indexes);
      setSelectedSizes(initialSizes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    products.forEach((product) => {
      product.images.forEach((img) => {
        const image = new Image();
        image.src = img.src;
      });
    });
  }, [products]);

  // Функции для навигации по изображениям
  const nextImage = (productIndex) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productIndex]:
        (prev[productIndex] + 1) % products[productIndex].images.length,
    }));
  };

  const prevImage = (productIndex) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productIndex]:
        (prev[productIndex] - 1 + products[productIndex].images.length) %
        products[productIndex].images.length,
    }));
  };

  // Обработчик выбора размера
  const handleSizeChange = (productIndex, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productIndex]: size,
    }));
  };

  // Функция для раскрытия/сворачивания карточки
  const toggleCardExpansion = (productIndex) => {
    setExpandedCards((prev) => ({
      ...prev,
      [productIndex]: !prev[productIndex],
    }));
  };

  // Функция проверки добавлен ли товар в корзину
  const isItemInCart = (productIndex) => {
    const product = products[productIndex];
    const selectedSize = selectedSizes[productIndex];

    return cart.some(
      (item) =>
        item.id === (product.id || productIndex) &&
        item.selectedSize?.size === selectedSize?.size
    );
  };

  // Функции для работы с корзиной
  const addToCart = (productIndex) => {
    const product = products[productIndex];
    const selectedSize = selectedSizes[productIndex];

    // Функция для преобразования цены
    const parsePrice = (priceString) => {
      if (!priceString) return 0;
      return parseFloat(priceString.replace(" ₽", "").replace(/\s/g, ""));
    };

    const cartItem = {
      id: product.id || productIndex,
      title: product.title,
      price: selectedSize?.priceInRubles
        ? parsePrice(selectedSize.priceInRubles)
        : parsePrice(product.price),
      image: product.images?.[0]?.src || "",
      selectedSize: selectedSize,
      quantity: 1,
    };

    setCart((prevCart) => [...prevCart, cartItem]);
  };

  const updateCartQuantity = (productId, sizeValue, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, sizeValue);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.selectedSize?.size === sizeValue
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId, sizeValue) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.id === productId && item.selectedSize?.size === sizeValue)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    clearCartFromStorage();
  };

  // Функция получения короткого названия товара
  const getShortTitle = (title) => {
    if (!title) return "";
    const words = title.split(" ");
    if (words.length <= 4) return title;
    return words.slice(0, 4).join(" ") + "...";
  };

  // Функция отправки заказа в Telegram
  const sendToTelegram = async (orderData) => {
    console.log(orderData);
    const TELEGRAM_BOT_TOKEN = "8190479365:AAHnjDWn6sr_8SF6Cj_jw7HR2-Cu1fM_syA"; // Замените на ваш токен бота
    const TELEGRAM_CHAT_ID = "-4893760815"; // Замените на ID вашей группы

    const orderText = `
🛍️ <b>НОВЫЙ ЗАКАЗ</b>

📦 <b>Товары:</b>
${orderData.items
  .map(
    (item) =>
      `• ${getShortTitle(item.title)}${
        item.selectedSize ? ` (${item.selectedSize.size})` : ""
      }\n  ${item.quantity}шт × ${item.price}₽ = <b>${
        item.quantity * item.price
      }₽</b>`
  )
  .join("\n")}

💰 <b>Итого: ${orderData.totalPrice}₽</b>

📞 <b>Контакт:</b> ${
      orderData.contactMethod === "phone"
        ? "📱"
        : orderData.contactMethod === "telegram"
        ? "📲"
        : orderData.contactMethod === "whatsapp"
        ? "💬"
        : "📷"
    } ${orderData.contactValue}

⏰ <b>Дата:</b> ${new Date().toLocaleString("ru-RU")}
    `;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: orderText,
            parse_mode: "HTML",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка отправки в Telegram");
      }
    } catch (error) {
      console.error("Error sending to Telegram:", error);
      throw error;
    }
  };

  const handleOrderSubmit = async (contactMethod, contactValue) => {
    const orderData = {
      items: cart,
      totalPrice: Math.round(
        Object.values(cart).reduce((sum, item) => {
          // Если price уже число - используем как есть, если строка - преобразуем
          const itemPrice =
            typeof item.price === "string"
              ? parseFloat(item.price.replace(" ₽", "").replace(/\s/g, ""))
              : item.price;

          return sum + itemPrice * item.quantity;
        }, 0)
      ),
      contactMethod,
      contactValue,
      timestamp: new Date().toISOString(),
    };

    try {
      await sendToTelegram(orderData);
      setLastContactMethod(contactMethod);
      setShowCartModal(false);
      setShowSuccessModal(true);
      clearCart();
    } catch (error) {
      alert("Ошибка при отправке заказа. Попробуйте еще раз.");
    }
  };

  // Функция для отрисовки рейтинга звездочками
  const renderRatingStars = (rating) => {
    const roundedRating = Math.round(rating * 10) / 10;
    const fullStars = Math.floor(roundedRating);
    const hasHalfStar = roundedRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-3 h-3 fill-current text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-3 h-3 text-gray-300" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className="w-3 h-3 fill-current text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
        ))}
        <span className="ml-1 text-xs text-gray-600">{roundedRating}</span>
      </div>
    );
  };

  // Обработчики свайпа
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (index) => {
    const deltaX = touchStartX.current - touchEndX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextImage(index);
      } else {
        prevImage(index);
      }
    }
  };

  // Функция для определения нужности обрезки текста
  const shouldTruncateTitle = (title) => {
    return title && title.length > 60;
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Ошибка</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Товаров пока нет
          </h2>
          <p className="text-gray-600">
            Сохраните первую карточку товара в конструкторе
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Сохраненные товары
          </h1>
          <p className="text-gray-600 mb-4">
            {products.length} товар
            {products.length % 10 === 1 && products.length % 100 !== 11
              ? ""
              : "ов"}
          </p>

          {/* Кнопка для мобильных */}
          <div className="block md:hidden">
            <button
              onClick={() =>
                setMobileDisplayMode(
                  mobileDisplayMode === "single" ? "double" : "single"
                )
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {mobileDisplayMode === "single"
                ? "Показать две карточки"
                : "Показать одну карточку"}
            </button>
          </div>
        </div>

        {/* Сетка товаров */}
        <div
          className={`grid ${
            // Для мобильных
            mobileDisplayMode === "single" ? "grid-cols-1" : "grid-cols-2"
          } ${
            // Для планшетов и десктопов (оставляем как было)
            "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          } gap-4 md:gap-6`}
        >
          {products.map((product, index) => (
            <div
              key={product.id || index}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-300"
            >
              {/* Слайдер изображений */}
              <div
                className="relative group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(index)}
              >
                {product.images && product.images.length > 0 && (
                  <>
                    <img
                      src={product.images[currentImageIndexes[index]].src}
                      alt={
                        product.images[currentImageIndexes[index]].alt ||
                        product.title
                      }
                      loading="lazy"
                      className="h-48 md:h-56 w-auto object-cover rounded-t-xl mx-auto"
                    />

                    {/* Навигация по изображениям */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage(index);
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage(index);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Индикатор изображений */}
                    {product.images.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {product.images.map((_, imgIndex) => (
                          <div
                            key={imgIndex}
                            className={`pagination-dot ${
                              imgIndex === currentImageIndexes[index]
                                ? "active"
                                : ""
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Информация о товаре */}
              <div className="p-3 md:p-4">
                {/* Название и цена */}
                <div className="mb-3">
                  {/* Название с возможностью раскрытия */}
                  <div className="mb-2">
                    {shouldTruncateTitle(product.title) ? (
                      <div>
                        <h3
                          className={`font-semibold text-gray-900 text-sm md:text-base transition-all duration-300 ${
                            expandedCards[index] ? "" : "line-clamp-2"
                          }`}
                        >
                          {product.title}
                        </h3>
                        <button
                          onClick={() => toggleCardExpansion(index)}
                          className="flex items-center text-xs text-blue-600 hover:text-blue-800 mt-1 transition-colors"
                        >
                          {expandedCards[index] ? (
                            <>
                              <span>Свернуть</span>
                              <ChevronUp className="w-3 h-3 ml-1" />
                            </>
                          ) : (
                            <>
                              <span>Читать полностью</span>
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                        {product.title}
                      </h3>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-bold text-lg md:text-xl">
                      {selectedSizes[index]?.priceInRubles || product.price} ₽
                    </span>
                    {product.rating && renderRatingStars(product.rating)}
                  </div>
                </div>

                {/* Размеры */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-1">Размеры:</p>
                    {product.sizes.length <= 3 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size, sizeIndex) => (
                          <button
                            key={sizeIndex}
                            onClick={() => handleSizeChange(index, size)}
                            className={`px-2 py-1 rounded text-xs border ${
                              selectedSizes[index]?.size === size.size
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-gray-300 bg-gray-100 text-gray-700"
                            }`}
                          >
                            {size.size}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <SimpleSelect
                        defaultValue={product.sizes[0].size}
                        style={{ width: "100%" }}
                        onChange={(value) => {
                          const selectedSize = product.sizes.find(
                            (s) => s.size === value
                          );
                          if (selectedSize)
                            handleSizeChange(index, selectedSize);
                        }}
                        options={product.sizes.map((size) => ({
                          value: size.size,
                          label: `${size.size} - ${size.priceInRubles} ₽`,
                        }))}
                      />
                    )}
                  </div>
                )}

                {/* Кнопка добавления в корзину */}
                {isItemInCart(index) ? (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg text-sm md:text-base flex items-center justify-center cursor-not-allowed"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Добавлено
                  </button>
                ) : (
                  <button
                    onClick={() => addToCart(index)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base flex items-center justify-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Добавить в корзину
                  </button>
                )}
              </div>

              {/* Бейдж новинки */}
              {product.isNew && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Новинка
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Пагинация (если нужно) */}
        {products.length > 12 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button className="px-3 py-2 border rounded text-sm">
                Назад
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-2 border rounded text-sm">
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Плавающая кнопка корзины */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <button
            onClick={() => setShowCartModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Корзина ({totalItemsInCart})</span>
          </button>
        </div>
      )}

      {/* Модальные окна */}
      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        cart={cart}
        updateQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        onSubmitOrder={handleOrderSubmit}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        contactMethod={lastContactMethod}
      />

      {/* Стили для обрезки текста */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pagination-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background-color: rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
        }

        .pagination-dot.active {
          width: 10px;
          height: 10px;
          background-color: #2563eb;
          box-shadow: 0 0 4px rgba(37, 99, 235, 0.6);
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;
