import { useState } from "react";
import { X } from "lucide-react";

const MarginCalculator = () => {
  const [calculator, setCalculator] = useState({
    baseAmount: "",
    operations: [],
    result: 0,
  });
  const [operations, setOperations] = useState([
    { type: "add", value: "", label: "Прибавление" },
    { type: "multiply", value: "", label: "Умножение" },
    { type: "percent", value: "", label: "Процент" },
  ]);

  const calculateResult = () => {
    let result = calculator.baseAmount === "" ? 0 : Number(calculator.baseAmount);
    
    operations.forEach((op) => {
      const value = op.value === "" ? 0 : Number(op.value);
      if (op.type === "add") result += value;
      if (op.type === "multiply") result *= (value === 0 ? 1 : value);
      if (op.type === "percent") result *= 1 + value / 100;
    });
    return result;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-800">Калькулятор маржи</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Базовая сумма
          </label>
          <input
            type="number"
            value={calculator.baseAmount}
            placeholder="0"
            onChange={(e) =>
              setCalculator({
                ...calculator,
                baseAmount: e.target.value,
              })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Результат
          </label>
          <div className="p-3 bg-blue-50 rounded-lg font-bold text-blue-700 text-lg">
            {calculateResult().toFixed(2)} ₽
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {operations.map((op, index) => (
          <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <select
              value={op.type}
              onChange={(e) => {
                const newOps = [...operations];
                newOps[index].type = e.target.value;
                setOperations(newOps);
              }}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="add">+ Прибавить</option>
              <option value="multiply">× Умножить</option>
              <option value="percent">+ Процент</option>
            </select>

            <input
              type="number"
              value={op.value}
              placeholder="0"
              onChange={(e) => {
                const newOps = [...operations];
                newOps[index].value = e.target.value;
                setOperations(newOps);
              }}
              className="p-2 border border-gray-300 rounded-lg w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <button
              onClick={() =>
                setOperations(operations.filter((_, i) => i !== index))
              }
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Удалить операцию"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          onClick={() =>
            setOperations([...operations, { type: "add", value: "" }])
          }
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Добавить операцию</span>
        </button>
      </div>
    </div>
  );
};

export default MarginCalculator;