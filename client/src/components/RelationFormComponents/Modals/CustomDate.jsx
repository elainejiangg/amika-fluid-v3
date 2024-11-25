import React, { useState } from "react";

export default function CustomDate({ isOpen, onClose, onSubmit }) {
  const [customDate, setCustomDate] = useState("");

  const handleSubmit = () => {
    onSubmit(customDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-1/4">
        <h2 className="text-lg font-semibold mb-4">Enter Custom Date</h2>
        <input
          type="text"
          className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          placeholder="e.g., a week ago, sometime last month"
        />
        <div className="mt-4 flex justify-end">
          <button
            className="mr-2 px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
