// components/AIAnalysisService.js
import { useState } from 'react';

const OPENROUTER_API_KEY = "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";

export const useAIAnalysis = () => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeMarketData = async (data, marketplace, period, type, userPurchasePrice = null, searchQuery = "") => {
    setAiLoading(true);
    setError("");

    try {
      // Подготавливаем данные для анализа
      const analysisData = data.slice(0, 10).map((item) => ({
        name: item.product?.name || "Неизвестный товар",
        turnover: item.turnover || 0,
        sales: item.Sales || 0,
        sellPrice: item.product?.real_price || 0,
        commission: item.sell_commission || 0,
        buyout: item.buyout || 0,
        rating: item.product?.rate || 0,
        reviews: item.product?.comments_count || 0,
        amount: item.last_amount || 0,
        sku: item.sku,
      }));

      const prompt = `Ты - эксперт по аналитике маркетплейсов. Проанализируй данные товаров и дай рекомендации по продажам.

Данные товаров:
${JSON.stringify(analysisData, null, 2)}

${userPurchasePrice ? `Цена закупки пользователя: ${userPurchasePrice} рублей` : ""}

Маркетплейс: ${marketplace}
Период анализа: ${period}
Тип продажи: ${type}
${searchQuery ? `Поисковый запрос: ${searchQuery}` : ""}

Проанализируй данные и дай конкретные рекомендации:

1. Общий анализ рынка в этой нише
2. Топ-3 самых перспективных товара с обоснованием
3. ${userPurchasePrice
        ? `Рекомендации по закупке при цене ${userPurchasePrice} руб:
   - Рекомендуемая цена продажи
   - Ожидаемая маржа
   - Количество товара для первой закупки
   - Прогноз окупаемости`
        : "Запроси у пользователя цену закупки для детальных рекомендаций"
      }
4. Риски и предупреждения
5. Конкретные действия для входа в нишу

Отвечай кратко, структурированно и по делу. Используй конкретные цифры из данных.`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "MoneyPlace AI Analytics",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 1500,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const analysis = aiResponse.choices[0].message.content;

      const analysisResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleString("ru-RU"),
        query: searchQuery,
        marketplace: marketplace,
        period: period,
        type: type,
        purchasePrice: userPurchasePrice,
        analysis: analysis,
        dataCount: analysisData.length,
      };

      setAiAnalysis(analysisResult);
      return analysisResult;

    } catch (error) {
      console.error("AI Analysis error:", error);
      setError(`Ошибка AI анализа: ${error.message}`);
      throw error;
    } finally {
      setAiLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAiAnalysis(null);
    setError("");
  };

  return {
    aiAnalysis,
    aiLoading,
    error,
    analyzeMarketData,
    clearAnalysis,
    setAiAnalysis // для возможности установки извне, например из истории
  };
};

export default useAIAnalysis;