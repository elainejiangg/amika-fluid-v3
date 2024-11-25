import React, { useState, useEffect } from "react";

export default function CustomRecurrence({
  isOpen,
  onClose,
  onSubmit,
  initialRecurrence,
}) {
  const [num, setNum] = useState(1);
  const [unit, setUnit] = useState("day");

  useEffect(() => {
    if (initialRecurrence) {
      setNum(initialRecurrence.num || 1);
      setUnit(initialRecurrence.unit || "day");
    }
  }, [initialRecurrence]);

  const handleNumChange = (e) => {
    const value = e.target.value;
    setNum(value);
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  const handleSubmit = () => {
    const parsedNum = parseInt(num, 10);
    if (isNaN(parsedNum) || parsedNum < 1) {
      alert("Number must be greater than or equal to 1");
      return;
    }
    onSubmit({ num: parsedNum, unit });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Custom Recurrence</h2>
        <div className="flex items-center mb-4 ">
          <p className="pr-2"> Every </p>
          <input
            type="number"
            className="border border-gray-300 p-2 mr-2 w-1/6 h-1/4"
            value={num}
            onChange={handleNumChange}
            min="1"
          />
          <select
            className="border border-gray-300 p-2"
            value={unit}
            onChange={handleUnitChange}
          >
            <option value="second">second{num > 1 ? "s" : ""}</option>
            <option value="minute">minute{num > 1 ? "s" : ""}</option>
            <option value="day">day{num > 1 ? "s" : ""}</option>
            <option value="week">week{num > 1 ? "s" : ""}</option>
            <option value="month">month{num > 1 ? "s" : ""}</option>
            <option value="year">year{num > 1 ? "s" : ""}</option>
          </select>
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={handleSubmit}
        >
          Submit
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
