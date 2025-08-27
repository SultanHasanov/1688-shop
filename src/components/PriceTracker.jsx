import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Package,
  AlertCircle,
  CheckCircle,
  Settings,
  Send,
  X
} from "lucide-react";

const API_KEY = import.meta.env.VITE_API_KEY;
const API_BASE = import.meta.env.VITE_API_BASE;
const TELEGRAM_BOT_TOKEN = "8190479365:AAHnjDWn6sr_8SF6Cj_jw7HR2-Cu1fM_syA"; // Замените на токен бота
const TELEGRAM_CHAT_ID = "-4893760815"; // Замените на ID чата
const MOKKY_API = "https://3a2467b5bbdb2034.mokky.dev/items";

const PriceTracker = () => {
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Форма создания/редактирования события
  const [formData, setFormData] = useState({
    sku: "",
    mp: "wildberries",
    interval: 60, // секунды
    active: true,
    name: ""
  });

  const intervals = [
    { value: 10, label: "10 секунд" },
    { value: 20, label: "20 секунд" },
    { value: 30, label: "30 секунд" },
    { value: 60, label: "1 минута" },
    { value: 3600, label: "1 час" },
    { value: 10800, label: "3 часа" },
    { value: 18000, label: "5 часов" },
    { value: 36000, label: "10 часов" }
  ];

  const marketplaces = [
    { value: "wildberries", label: "Wildberries", color: "bg-purple-500" },
    { value: "ozon", label: "Ozon", color: "bg-blue-500" }
  ];

  // Интервалы для активных событий
  const intervalRefs = useRef(new Map());

  useEffect(() => {
    loadEventsFromAPI();
  }, []);

  const loadEventsFromAPI = async () => {
    try {
      const response = await fetch(MOKKY_API);
      if (response.ok) {
        const events = await response.json();
        setTrackingEvents(events);
        // Запускаем активные события
        events.filter(event => event.active).forEach(event => {
          startTracking(event);
        });
      }
    } catch (error) {
      console.error("Ошибка загрузки событий:", error);
    }
  };

  const saveEventToAPI = async (event) => {
    try {
      const response = await fetch(MOKKY_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
      if (response.ok) {
        const savedEvent = await response.json();
        return savedEvent;
      }
    } catch (error) {
      console.error("Ошибка сохранения события:", error);
    }
    return null;
  };

  const updateEventInAPI = async (eventId, updatedData) => {
    try {
      const response = await fetch(`${MOKKY_API}/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        const updatedEvent = await response.json();
        return updatedEvent;
      }
    } catch (error) {
      console.error("Ошибка обновления события:", error);
    }
    return null;
  };

  const deleteEventFromAPI = async (eventId) => {
    try {
      const response = await fetch(`${MOKKY_API}/${eventId}`, {
        method: "DELETE",
      });
      return response.ok;
    } catch (error) {
      console.error("Ошибка удаления события:", error);
      return false;
    }
  };

  const makeApiRequest = async (sku, mp) => {
    try {
      const queryParams = new URLSearchParams({
        "q[sku][equal]": sku,
        "q[mp][equal]": mp,
        "expand": "category,seller,brand"
      });
      
      const response = await fetch(`${API_BASE}/v1/product?${queryParams}`, {
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
      return data[0] || null; // Возвращаем первый найденный товар
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  };

  const sendTelegramMessage = async (message) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send Telegram message");
      }
    } catch (error) {
      console.error("Telegram Error:", error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPriceChangeIcon = (oldPrice, newPrice) => {
    if (newPrice > oldPrice) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (newPrice < oldPrice) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getPriceChangeColor = (oldPrice, newPrice) => {
    if (newPrice > oldPrice) return "text-red-500";
    if (newPrice < oldPrice) return "text-green-500";
    return "text-gray-500";
  };

  const checkPrice = async (event) => {
    const productData = await makeApiRequest(event.sku, event.mp);
    
    if (!productData) {
      console.error(`Не удалось получить данные для товара ${event.sku}`);
      return;
    }

    const currentPrice = productData.real_price;
    const oldPrice = event.currentPrice;
    const priceChanged = oldPrice !== currentPrice;

    // Обновляем событие
    const updatedEventData = {
      currentPrice,
      lastChecked: new Date().toISOString(),
      priceHistory: [
        ...(event.priceHistory || []),
        {
          price: currentPrice,
          date: new Date().toISOString()
        }
      ].slice(-50) // Храним последние 50 записей
    };

    // Обновляем в API
    const updatedEvent = await updateEventInAPI(event.id, updatedEventData);
    
    if (updatedEvent) {
      setTrackingEvents(prev => 
        prev.map(e => e.id === event.id ? { ...e, ...updatedEventData } : e)
      );
    }

    // Отправляем сообщение в Telegram
    const marketplaceName = marketplaces.find(mp => mp.value === event.mp)?.label || event.mp;
    const priceChangeText = priceChanged 
      ? `\n💰 Цена изменилась: ${formatPrice(oldPrice)} → ${formatPrice(currentPrice)}`
      : `\n💰 Цена не изменилась: ${formatPrice(currentPrice)}`;
    
    const changeEmoji = currentPrice > oldPrice ? "📈" : currentPrice < oldPrice ? "📉" : "➖";
    
    const message = `${changeEmoji} <b>${event.name || productData.name}</b>
    
🏪 Маркетплейс: ${marketplaceName}
🔍 Артикул: ${event.sku}
⏰ Проверено: ${new Date().toLocaleString('ru-RU')}${priceChangeText}`;

    await sendTelegramMessage(message);
  };

  const startTracking = (event) => {
    if (intervalRefs.current.has(event.id)) {
      return; // Уже отслеживается
    }

    const intervalId = setInterval(() => {
      checkPrice(event);
    }, event.interval * 1000);

    intervalRefs.current.set(event.id, intervalId);
    
    // Первая проверка сразу
    checkPrice(event);
  };

  const stopTracking = (eventId) => {
    if (intervalRefs.current.has(eventId)) {
      clearInterval(intervalRefs.current.get(eventId));
      intervalRefs.current.delete(eventId);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.sku.trim()) return;

    setLoading(true);
    const productData = await makeApiRequest(formData.sku, formData.mp);
    
    if (!productData) {
      alert("Товар не найден. Проверьте артикул и маркетплейс.");
      setLoading(false);
      return;
    }

    const newEventData = {
      ...formData,
      name: formData.name || productData.name,
      initialPrice: productData.real_price,
      currentPrice: productData.real_price,
      productName: productData.name,
      productImage: productData.image,
      createdAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      priceHistory: [{
        price: productData.real_price,
        date: new Date().toISOString()
      }]
    };

    // Сохраняем в API
    const savedEvent = await saveEventToAPI(newEventData);
    
    if (savedEvent) {
      const updatedEvents = [...trackingEvents, savedEvent];
      setTrackingEvents(updatedEvents);

      if (savedEvent.active) {
        startTracking(savedEvent);
      }

      setShowCreateForm(false);
      resetForm();
    } else {
      alert("Ошибка сохранения события. Попробуйте еще раз.");
    }

    setLoading(false);
  };

  const handleUpdateEvent = async () => {
    if (!formData.sku.trim() || !editingEvent) return;

    setLoading(true);
    const productData = await makeApiRequest(formData.sku, formData.mp);
    
    if (!productData) {
      alert("Товар не найден. Проверьте артикул и маркетплейс.");
      setLoading(false);
      return;
    }

    const updatedEventData = {
      ...formData,
      name: formData.name || productData.name,
      productName: productData.name,
      productImage: productData.image
    };

    // Обновляем в API
    const updatedEvent = await updateEventInAPI(editingEvent.id, updatedEventData);
    
    if (updatedEvent) {
      const updatedEvents = trackingEvents.map(event => 
        event.id === editingEvent.id ? { ...event, ...updatedEventData } : event
      );

      setTrackingEvents(updatedEvents);

      // Перезапускаем отслеживание с новыми параметрами
      stopTracking(editingEvent.id);
      const finalUpdatedEvent = { ...editingEvent, ...updatedEventData };
      if (finalUpdatedEvent.active) {
        startTracking(finalUpdatedEvent);
      }

      setEditingEvent(null);
      resetForm();
    } else {
      alert("Ошибка обновления события. Попробуйте еще раз.");
    }

    setLoading(false);
  };

  const toggleEventActive = async (eventId) => {
    const event = trackingEvents.find(e => e.id === eventId);
    if (!event) return;

    const updatedActiveStatus = !event.active;
    
    // Обновляем в API
    const updatedEvent = await updateEventInAPI(eventId, { active: updatedActiveStatus });
    
    if (updatedEvent) {
      const updatedEvents = trackingEvents.map(e => {
        if (e.id === eventId) {
          const updated = { ...e, active: updatedActiveStatus };
          
          if (updated.active) {
            startTracking(updated);
          } else {
            stopTracking(eventId);
          }
          
          return updated;
        }
        return e;
      });

      setTrackingEvents(updatedEvents);
    }
  };

  const deleteEvent = async (eventId) => {
    if (confirm("Удалить событие отслеживания?")) {
      const success = await deleteEventFromAPI(eventId);
      
      if (success) {
        stopTracking(eventId);
        const updatedEvents = trackingEvents.filter(event => event.id !== eventId);
        setTrackingEvents(updatedEvents);
      } else {
        alert("Ошибка удаления события. Попробуйте еще раз.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      sku: "",
      mp: "wildberries",
      interval: 60,
      active: true,
      name: ""
    });
  };

  const openEditForm = (event) => {
    setFormData({
      sku: event.sku,
      mp: event.mp,
      interval: event.interval,
      active: event.active,
      name: event.name
    });
    setEditingEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Отслеживание цен</h1>
                <p className="text-gray-600">Мониторинг изменений цен товаров с уведомлениями в Telegram</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Добавить товар</span>
            </button>
          </div>
        </div>

        {/* Create/Edit Form Modal */}
        {(showCreateForm || editingEvent) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEvent ? "Редактировать событие" : "Добавить товар для отслеживания"}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название события (необязательно)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: iPhone 13 отслеживание"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Артикул товара *
                  </label>
                  <input
                    type="text"
                    placeholder="Введите артикул"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Маркетплейс
                  </label>
                  <select
                    value={formData.mp}
                    onChange={(e) => setFormData(prev => ({ ...prev, mp: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {marketplaces.map((mp) => (
                      <option key={mp.value} value={mp.value}>
                        {mp.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Интервал проверки
                  </label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {intervals.map((interval) => (
                      <option key={interval.value} value={interval.value}>
                        {interval.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Начать отслеживание сразу
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                    disabled={loading || !formData.sku.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{loading ? "Загрузка..." : editingEvent ? "Обновить" : "Создать"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {trackingEvents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Нет событий отслеживания
              </h3>
              <p className="text-gray-600 mb-6">
                Добавьте товары для отслеживания их цен и получения уведомлений
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Добавить первый товар</span>
              </button>
            </div>
          ) : (
            trackingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Product Image */}
                  {event.productImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={event.productImage}
                        alt={event.productName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {event.name || event.productName}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded text-white ${marketplaces.find(mp => mp.value === event.mp)?.color}`}>
                            {marketplaces.find(mp => mp.value === event.mp)?.label}
                          </span>
                          <span>Артикул: {event.sku}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {event.active ? (
                          <span className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Активно
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Приостановлено
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Начальная цена</div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(event.initialPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Текущая цена</div>
                        <div className={`text-lg font-bold flex items-center ${getPriceChangeColor(event.initialPrice, event.currentPrice)}`}>
                          {getPriceChangeIcon(event.initialPrice, event.currentPrice)}
                          <span className="ml-1">{formatPrice(event.currentPrice)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Интервал</div>
                        <div className="text-lg font-bold text-gray-900 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {intervals.find(i => i.value === event.interval)?.label}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Последняя проверка</div>
                        <div className="text-sm text-gray-900">
                          {new Date(event.lastChecked).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleEventActive(event.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                          event.active 
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {event.active ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>Приостановить</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Запустить</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openEditForm(event)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Изменить</span>
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Удалить</span>
                      </button>
                      <button
                        onClick={() => checkPrice(event)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center space-x-1"
                      >
                        <Send className="w-4 h-4" />
                        <span>Проверить сейчас</span>
                      </button>
                    </div>

                    {/* Price History */}
                    {event.priceHistory && event.priceHistory.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">История цен (последние 5 изменений)</h4>
                        <div className="space-y-1">
                          {event.priceHistory.slice(-5).map((history, index) => (
                            <div key={index} className="flex justify-between text-xs text-gray-600">
                              <span>{new Date(history.date).toLocaleString('ru-RU')}</span>
                              <span>{formatPrice(history.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceTracker;