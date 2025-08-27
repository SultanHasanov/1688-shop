// components/AIAnalysisPanel.js
import React from 'react';
import { Bot, X, TrendingUp, CheckCircle, DollarSign, MessageSquare } from 'lucide-react';

const AIAnalysisPanel = ({
  analysis,
  loading,
  purchasePrice,
  onPurchasePriceChange,
  onAnalyze,
  onClose,
  analysisHistory = [],
  onSelectFromHistory,
  showPurchaseInput = true
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };


  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Анализ рынка
            </h3>
            <p className="text-sm text-gray-600">
              Рекомендации на основе данных
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!analysis ? (
        <div className="bg-white rounded-lg p-6 border border-blue-200">
          <div className="text-center mb-6">
            <Bot className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Получить AI рекомендации по торговле
            </h4>
            <p className="text-gray-600">
              {showPurchaseInput 
                ? "Введите цену закупки товара для персональных рекомендаций"
                : "Запустите анализ для получения рекомендаций"
              }
            </p>
          </div>

          {showPurchaseInput && (
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Цена закупки товара (в рублях){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  placeholder="Например: 1500"
                  value={purchasePrice}
                  onChange={(e) => onPurchasePriceChange(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
                  min="1"
                  step="1"
                />
                <span className="text-gray-500 font-medium">₽</span>
              </div>

              <button
                onClick={onAnalyze}
                disabled={loading || (showPurchaseInput && (!purchasePrice || purchasePrice <= 0))}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Анализирую данные...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    <span>Получить AI рекомендации</span>
                  </>
                )}
              </button>

              {showPurchaseInput && !purchasePrice && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Цена закупки необходима для расчета маржи и рентабельности
                </p>
              )}
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI анализирует данные рынка...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">
                Анализ от {analysis.timestamp} | {analysis.dataCount}{" "}
                товаров
              </span>
            </div>
            {analysis.purchasePrice && (
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Закупка: {formatPrice(analysis.purchasePrice)}
                </span>
              </div>
            )}
          </div>
          <div className="prose max-w-none">
            <div
              className="text-sm text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: analysis.analysis
                  .replace(
                    /### (.+)/g,
                    '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-2">$1</h3>'
                  )
                  .replace(
                    /\*\*(.+?)\*\*/g,
                    '<strong class="font-semibold text-gray-900">$1</strong>'
                  )
                  .replace(/- (.+)/g, '<li class="ml-4 mb-2">$1</li>')
                  .replace(
                    /(\d+\. .+)/g,
                    '<div class="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"><div class="font-medium text-blue-900">$1</div></div>'
                  )
                  .replace(/\n\n/g, "")
                  .replace(/\n/g, ""),
              }}
            />
          </div>
        </div>
      )}

      {/* История анализов */}
      {analysisHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            История анализов:
          </h4>
          <div className="space-y-2">
            {analysisHistory.map((historyItem) => (
              <div
                key={historyItem.id}
                className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onSelectFromHistory(historyItem)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {historyItem.query || "Анализ статистики"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {historyItem.timestamp}
                  </span>
                </div>
                {historyItem.purchasePrice && (
                  <div className="text-xs text-green-600 mt-1">
                    Цена закупки: {formatPrice(historyItem.purchasePrice)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;