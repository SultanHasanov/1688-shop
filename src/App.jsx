import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  Image,
  Tag,
  DollarSign,
  Ruler,
  AlertCircle,
  Settings,
  Calculator,
  Edit3,
  Save,
  Trash2,
  Eye,
} from "lucide-react";
import GalleryParser from "./components/GalleryParser";
import { useNavigate } from "react-router-dom";
import ProductCardBuilder from "./components/ProductCardBuilder";

const Parser1688 = () => {
  const [htmlInput, setHtmlInput] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [useAdvancedTranslation, setUseAdvancedTranslation] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [productCard, setProductCard] = useState({
    title: "",
    price: "",
    images: [],
    sizes: [],
    colors: [],
    description: "",
  });
  const navigate = useNavigate();

  // Настройки конвертации валют
  const [currencySettings, setCurrencySettings] = useState({
    exchangeRate: 13.5,
    useAutoRate: true,
    shippingCost: 0,
    markupPercent: 0,
    autoUpdateRate: false,
  });

  const [showSettings, setShowSettings] = useState(false);

  // Функция для сохранения карточки в API
 

  // Функция для обновления карточки товара из распарсенных данных
  useEffect(() => {
    if (parsedData) {
      setProductCard((prev) => ({
        ...prev,
        title: parsedData.title || "",
        price: parsedData.priceInRubles?.display || parsedData.price || "",
        sizes: parsedData.sizes || [],
        colors: parsedData.colors || [],
      }));
    }
  }, [parsedData]);

  // Автоматическое получение курса валют
  const getExchangeRate = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/CNY"
      );
      const data = await response.json();
      return data.rates.RUB || 13.5; // fallback к 13.5 если API недоступен
    } catch (error) {
      console.error("Ошибка получения курса:", error);
      return 13.5; // fallback курс
    }
  };

  // Обновление курса при загрузке компонента
  useEffect(() => {
    if (currencySettings.useAutoRate) {
      getExchangeRate().then((rate) => {
        setCurrencySettings((prev) => ({ ...prev, exchangeRate: rate }));
      });
    }
  }, [currencySettings.useAutoRate]);

  // Функция для конвертации цены
  const convertPrice = (yuanPrice) => {
    const price = parseFloat(yuanPrice.replace(/[^\d.]/g, ""));
    if (isNaN(price)) return null;

    const baseRublePrice = price * currencySettings.exchangeRate;
    const withMarkup =
      baseRublePrice * (1 + currencySettings.markupPercent / 100);
    const finalPrice = withMarkup + currencySettings.shippingCost;

    return {
      yuan: price,
      rubleBase: baseRublePrice,
      rubleWithMarkup: withMarkup,
      final: finalPrice,
    };
  };

  // Расширенный словарь для базового перевода
  const chineseToRussianDict = {
    // Цвета
    黑色: "Черный",
    白色: "Белый",
    绿色: "Зеленый",
    藏青色: "Темно-синий",
    奶白色: "Кремово-белый",
    亮粉: "Ярко-розовый",
    卡其色: "Хаки",
    军绿色: "Военно-зеленый",
    深灰色: "Темно-серый",
    酒红色: "Бордовый",
    浅绿色: "Светло-зеленый",
    牛仔蓝: "Джинсовый синий",
    红色: "Красный",
    蓝色: "Синий",
    黄色: "Желтый",
    粉色: "Розовый",
    紫色: "Фиолетовый",
    橙色: "Оранжевый",
    棕色: "Коричневый",
    灰色: "Серый",

    // Услуги и сервис
    退货包运费: "Возврат с бесплатной доставкой",
    "7天无理由退货": "7 дней возврата без объяснения причин",
    晚发必赔: "Компенсация за задержку отправки",
    极速退款: "Быстрый возврат средств",
    一件代发: "Дропшиппинг",
    现货: "В наличии",
    预售: "Предзаказ",

    // Общие термины
    库存: "Склад",
    件: "шт.",
    起批: "мин. заказ",
    价格: "Цена",
    优惠: "Скидка",
    服务: "Сервис",
    发货: "Доставка",
    收藏: "В избранное",
    评价: "отзывов",
    成交: "продано",
    满: "при заказе от",
    减: "скидка",
    券: "купон",
    包邮: "Бесплатная доставка",
    现货发售: "В наличии, готов к отправке",

    // Кастомизация
    加图加字: "Добавить изображение и текст",
    印错包赔: "Компенсация при ошибке печати",
    左胸: "Левая грудь",
    前胸: "Передняя часть груди",
    后背: "Спина",
    右肩: "Правое плечо",
    左肩: "Левое плечо",
    贴牌换标: "Замена этикетки/бирки",
    更换客户标: "Замена на этикетку клиента",
    使用商家标: "Использовать этикетку продавца",
    不使用商家标: "Не использовать этикетку продавца",
    个性定制三标: "Персонализированные три этикетки",
    商家赠送: "Подарок от продавца",

    // Одежда и материалы
    男装: "Мужская одежда",
    女装: "Женская одежда",
    童装: "Детская одежда",
    短袖: "Короткий рукав",
    长袖: "Длинный рукав",
    连衣裙: "Платье",
    衬衫: "Рубашка",
    外套: "Куртка",
    裤子: "Брюки",
    裙子: "Юбка",
    纯棉: "100% хлопок",
    针织: "Трикотаж",
    纯色: "Однотонный",
    打底衫: "Базовая футболка",
    上衣: "Верх",
    夏季: "Летний",
    潮牌: "Модный бренд",
    服饰: "Одежда",
    t恤: "Футболка",

    // Размеры
    码: "размер",
    尺寸: "размер",
    大小: "размер",
    号: "размер",

    // Дополнительные термины
    批发: "Оптовая торговля",
    代发: "Дропшиппинг",
    权益: "Права",
    会员: "Член",
    折: "скидка",
    起: "от",
    选择: "Выбрать",
    收货: "Получение",
    地址: "Адрес",
    颜色: "Цвет",
    尺码: "Размер",
    立即: "Немедленно",
    订购: "Заказать",
    采购: "Закупка",
    车: "Корзина",
    跨境: "Трансграничный",
    铺货: "Поставка товара",
    举报: "Пожаловаться",
    浙江: "Чжэцзян",
    金华: "Цзиньхуа",
    送至: "Доставка в",
  };

  // Функция для перевода с использованием словаря
  const translateWithDict = (text) => {
    if (!text || typeof text !== "string") return text;

    const cleanText = text.trim();

    // Прямое совпадение
    if (chineseToRussianDict[cleanText]) {
      return chineseToRussianDict[cleanText];
    }

    // Частичные совпадения
    let translated = cleanText;
    for (const [chinese, russian] of Object.entries(chineseToRussianDict)) {
      if (cleanText.includes(chinese)) {
        translated = translated.replace(new RegExp(chinese, "g"), russian);
      }
    }

    return translated !== cleanText ? translated : cleanText;
  };

  // Функция для определения китайских символов
  const containsChinese = (text) => {
    return /[\u4e00-\u9fff]/.test(text);
  };

  // Функция для продвинутого перевода через API
  const translateWithAPI = async (text) => {
    if (!containsChinese(text)) return text;

    try {
      // Сначала пробуем словарь
      const dictResult = translateWithDict(text);
      if (dictResult !== text && !containsChinese(dictResult)) {
        return dictResult;
      }

      // Если в тексте остались китайские символы, используем API
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=zh|ru`
      );
      const data = await response.json();

      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      } else {
        return dictResult;
      }
    } catch (error) {
      console.error("Ошибка API перевода:", error);
      return translateWithDict(text);
    }
  };

  // Основная функция перевода
  const performTranslation = async (text) => {
    if (!text || !containsChinese(text)) return text;

    if (useAdvancedTranslation) {
      return await translateWithAPI(text);
    } else {
      return translateWithDict(text);
    }
  };

  // Функция для перевода всех текстовых узлов в HTML
  const translateAllChineseText = async (element) => {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (containsChinese(node.textContent.trim())) {
        textNodes.push(node);
      }
    }

    // Переводим все найденные текстовые узлы
    for (const textNode of textNodes) {
      const originalText = textNode.textContent.trim();
      if (originalText) {
        const translatedText = await performTranslation(originalText);
        if (translatedText !== originalText) {
          textNode.textContent = translatedText;
        }
      }
    }
  };

  // Функция для извлечения данных из HTML
  const parseHTML = async (html) => {
    setIsLoading(true);
    setError("");

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Переводим весь китайский текст в документе
      await translateAllChineseText(doc.body);

      const data = {
        title: "",
        price: "",
        priceInRubles: null,
        colors: [],
        sizes: [],
        images: [],
        services: [],
        customOptions: [],
      };

      // Извлекаем название товара
      const titleElement = doc.querySelector("h1");
      if (titleElement) {
        data.title = titleElement.textContent.trim();
      }

      // Извлекаем цену
      const priceElements = doc.querySelectorAll(".price-info");
      if (priceElements.length >= 2) {
        const minPrice = priceElements[0].textContent.replace(/[^\d.]/g, "");
        const maxPrice = priceElements[1].textContent.replace(/[^\d.]/g, "");
        data.price = `¥${minPrice} - ¥${maxPrice}`;

        const minPriceRub = convertPrice(minPrice);
        const maxPriceRub = convertPrice(maxPrice);
        if (minPriceRub && maxPriceRub) {
          data.priceInRubles = {
            range: true,
            min: minPriceRub,
            max: maxPriceRub,
            display: `${minPriceRub.final.toFixed(
              2
            )} ₽ - ${maxPriceRub.final.toFixed(2)} ₽`,
          };
        }
      } else if (priceElements.length === 1) {
        const price = priceElements[0].textContent.replace(/[^\d.]/g, "");
        data.price = `¥${price}`;

        const priceRub = convertPrice(price);
        if (priceRub) {
          data.priceInRubles = {
            range: false,
            single: priceRub,
            display: `${priceRub.final.toFixed(2)} ₽`,
          };
        }
      }

      // Извлекаем цвета
      const colorButtons = doc.querySelectorAll(
        ".feature-item .sku-filter-button"
      );
      for (const button of colorButtons) {
        const colorName = button.querySelector(".label-name");
        const colorImage = button.querySelector("img");
        if (colorName) {
          data.colors.push({
            name: colorName.textContent.trim(),
            image: colorImage ? colorImage.src : null,
          });
        }
      }

      // Извлекаем размеры и цены
      const sizeItems = doc.querySelectorAll(".expand-view-item");
      for (const item of sizeItems) {
        const sizeLabel = item.querySelector(".item-label");
        const priceStock = item.querySelectorAll(".item-price-stock");

        if (sizeLabel) {
          const size = sizeLabel.textContent.trim();
          const price = priceStock[0] ? priceStock[0].textContent.trim() : "";
          const stock = priceStock[1] ? priceStock[1].textContent.trim() : "";

          let priceInRubles = null;
          if (price && price.includes("¥")) {
            const yuanPrice = price.replace(/[^\d.]/g, "");
            const rubPrice = convertPrice(yuanPrice);
            if (rubPrice) {
              priceInRubles = `${rubPrice.final.toFixed(2)} ₽`;
            }
          }

          data.sizes.push({
            size,
            price,
            priceInRubles,
            stock,
          });
        }
      }

      // Извлекаем изображения
      const images = doc.querySelectorAll(".label-image-wrap img, .v-img-area");
      images.forEach((img) => {
        if (img.src && !data.images.includes(img.src)) {
          data.images.push(img.src);
        }
      });

      // Извлекаем услуги
      const serviceLinks = doc.querySelectorAll(".service-item-link");
      serviceLinks.forEach((link) => {
        const serviceText = link.textContent.trim();
        if (serviceText) {
          data.services.push(serviceText);
        }
      });

      // Извлекаем опции кастомизации
      const customItems = doc.querySelectorAll(".v-item");
      customItems.forEach((item) => {
        const nameEl = item.querySelector(".v-name");
        const priceEl = item.querySelector(".v-price");
        const beginEl = item.querySelector(".v-begin");

        if (nameEl) {
          let priceInRubles = null;
          const priceText = priceEl ? priceEl.textContent.trim() : "";

          if (priceText && priceText.includes("¥")) {
            const yuanPrice = priceText.replace(/[^\d.]/g, "");
            const rubPrice = convertPrice(yuanPrice);
            if (rubPrice) {
              priceInRubles = `${rubPrice.final.toFixed(2)} ₽`;
            }
          }

          data.customOptions.push({
            name: nameEl.textContent.trim(),
            price: priceText,
            priceInRubles,
            minOrder: beginEl ? beginEl.textContent.trim() : "",
          });
        }
      });

      setParsedData(data);
    } catch (err) {
      setError("Ошибка при обработке HTML: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParse = () => {
    if (!htmlInput.trim()) {
      setError("Пожалуйста, вставьте HTML разметку");
      return;
    }
    parseHTML(htmlInput);
  };

  const renderColorCard = (color, index) => (
    <div
      key={index}
      className="bg-white rounded-lg border p-3 flex items-center space-x-3"
    >
      {color.image && (
        <img
          src={color.image}
          alt={color.name}
          className="w-12 h-12 object-cover rounded"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
      <div>
        <div className="font-medium text-gray-900">{color.name}</div>
      </div>
    </div>
  );

  const renderSizeCard = (size, index) => (
    <div key={index} className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg text-blue-600">{size.size}</span>
        <div className="text-right">
          <div className="font-semibold text-green-600">{size.price}</div>
          {size.priceInRubles && (
            <div className="font-semibold text-blue-600 text-sm">
              {size.priceInRubles}
            </div>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-600">{size.stock}</div>
    </div>
  );

  const renderPriceBreakdown = (priceData) => {
    if (!priceData) return null;

    if (priceData.range) {
      return (
        <div className="bg-blue-50 p-4 rounded-lg mt-2">
          <h4 className="font-semibold text-blue-800 mb-2">
            Расчет цены (диапазон):
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>
                Мин: ¥{priceData.min.yuan} × {currencySettings.exchangeRate}
              </span>
              <span>{priceData.min.rubleBase.toFixed(2)} ₽</span>
            </div>
            <div className="flex justify-between">
              <span>
                Макс: ¥{priceData.max.yuan} × {currencySettings.exchangeRate}
              </span>
              <span>{priceData.max.rubleBase.toFixed(2)} ₽</span>
            </div>
            {currencySettings.markupPercent > 0 && (
              <div className="flex justify-between">
                <span>+ Наценка ({currencySettings.markupPercent}%)</span>
                <span>
                  {(
                    priceData.max.rubleWithMarkup - priceData.max.rubleBase
                  ).toFixed(2)}{" "}
                  ₽
                </span>
              </div>
            )}
            {currencySettings.shippingCost > 0 && (
              <div className="flex justify-between">
                <span>+ Доставка</span>
                <span>{currencySettings.shippingCost} ₽</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Итого:</span>
              <span>{priceData.display}</span>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-blue-50 p-4 rounded-lg mt-2">
          <h4 className="font-semibold text-blue-800 mb-2">Расчет цены:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>
                ¥{priceData.single.yuan} × {currencySettings.exchangeRate}
              </span>
              <span>₽{priceData.single.rubleBase.toFixed(2)}</span>
            </div>
            {currencySettings.markupPercent > 0 && (
              <div className="flex justify-between">
                <span>+ Наценка ({currencySettings.markupPercent}%)</span>
                <span>
                  ₽
                  {(
                    priceData.single.rubleWithMarkup -
                    priceData.single.rubleBase
                  ).toFixed(2)}
                </span>
              </div>
            )}
            {currencySettings.shippingCost > 0 && (
              <div className="flex justify-between">
                <span>+ Доставка</span>
                <span>₽{currencySettings.shippingCost}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Итого:</span>
              <span>{priceData.display}</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Парсер данных 1688 с калькулятором цен
            </h1>
            <p className="text-gray-600">
              Вставьте HTML разметку с сайта 1688 для извлечения информации о
              товаре и расчета цен в рублях
            </p>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors self-center sm:self-auto"
          >
            <Eye className="w-4 h-4" />
            <span>Посмотреть товары</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Левая панель - ввод */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-semibold">
                      Вставьте HTML разметку
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                {showSettings && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
                    <h3 className="font-semibold flex items-center space-x-2">
                      <Calculator className="w-4 h-4" />
                      <span>Настройки расчета цены</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Курс юаня к рублю
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            step="0.1"
                            value={currencySettings.exchangeRate}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCurrencySettings((prev) => ({
                                ...prev,
                                exchangeRate:
                                  value === "" ? "" : parseFloat(value) || 0,
                                useAutoRate: false,
                              }));
                            }}
                            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Доставка (₽)
                        </label>
                        <input
                          type="number"
                          value={currencySettings.shippingCost}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCurrencySettings((prev) => ({
                              ...prev,
                              shippingCost:
                                value === "" ? "" : parseFloat(value) || 0,
                            }));
                          }}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Наценка (%)
                        </label>
                        <input
                          type="number"
                          value={currencySettings.markupPercent}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCurrencySettings((prev) => ({
                              ...prev,
                              markupPercent:
                                value === "" ? "" : parseFloat(value) || 0,
                            }));
                          }}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useAdvancedTranslation}
                      onChange={(e) =>
                        setUseAdvancedTranslation(e.target.checked)
                      }
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Полный онлайн-перевод
                    </span>
                  </label>
                </div>

                <textarea
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  placeholder="Вставьте HTML разметку с сайта 1688..."
                  className="w-full h-64 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  onClick={handleParse}
                  disabled={isLoading}
                  className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>Парсить данные</span>
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-red-700">{error}</div>
                  </div>
                )}
              </div>
              {/* Блок конструктора карточки товара */}
              {parsedData && (
                <ProductCardBuilder
                  productCard={productCard}
                  setProductCard={setProductCard}
                  galleryImages={galleryImages}
                  parsedData={parsedData}
                />
              )}
            </div>

            {/* Правая панель - результаты */}
            <div className="space-y-4">
              {parsedData && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold mb-6">Данные товара</h2>

                  {/* Название */}
                  {parsedData.title && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold">Название товара</h3>
                      </div>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded">
                        {parsedData.title}
                      </p>
                      {/* Добавляем GalleryParser после всех остальных данных */}
                      <div className="bg-white rounded-lg shadow-sm border p-6">
                        <GalleryParser
                          htmlContent={htmlInput}
                          onImagesParsed={setGalleryImages}
                        />
                      </div>
                    </div>
                  )}

                  {/* Цена */}
                  {parsedData.price && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold">Цена</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-green-600">
                          {parsedData.price}
                        </p>
                        {parsedData.priceInRubles && (
                          <p className="text-2xl font-bold text-blue-600">
                            {parsedData.priceInRubles.display}
                          </p>
                        )}
                      </div>
                      {renderPriceBreakdown(parsedData.priceInRubles)}
                    </div>
                  )}

                  {/* Цвета */}
                  {parsedData.colors.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-blue-500 rounded-full"></div>
                        <h3 className="font-semibold">
                          Цвета ({parsedData.colors.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {parsedData.colors.map(renderColorCard)}
                      </div>
                    </div>
                  )}

                  {/* Размеры */}
                  {parsedData.sizes.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Ruler className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">
                          Размеры и цены ({parsedData.sizes.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {parsedData.sizes.map(renderSizeCard)}
                      </div>
                    </div>
                  )}

                  {/* Изображения */}
                  {parsedData.images.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Image className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold">
                          Изображения ({parsedData.images.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                        {parsedData.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Изображение ${index + 1}`}
                            className="w-full h-20 object-cover rounded border hover:scale-105 transition-transform cursor-pointer"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            onClick={() => window.open(img, "_blank")}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Услуги */}
                  {parsedData.services.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">
                        Услуги ({parsedData.services.length})
                      </h3>
                      <div className="space-y-2">
                        {parsedData.services.map((service, index) => (
                          <div
                            key={index}
                            className="bg-green-50 p-2 rounded border"
                          >
                            <div className="font-medium text-green-800">
                              {service}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Опции кастомизации */}
                  {parsedData.customOptions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        Кастомизация ({parsedData.customOptions.length})
                      </h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {parsedData.customOptions.map((option, index) => (
                          <div
                            key={index}
                            className="bg-blue-50 p-3 rounded border"
                          >
                            <div className="font-medium text-blue-800">
                              {option.name}
                            </div>
                            <div className="text-sm text-blue-600 flex justify-between">
                              <div>
                                <span className="font-semibold">
                                  {option.price}
                                </span>
                                {option.priceInRubles && (
                                  <span className="ml-2 text-purple-600">
                                    {option.priceInRubles}
                                  </span>
                                )}
                              </div>
                              <span>{option.minOrder}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!parsedData && !isLoading && (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Результаты появятся здесь
                  </h3>
                  <p className="text-gray-500">
                    Вставьте HTML разметку и нажмите "Парсить данные"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parser1688;
