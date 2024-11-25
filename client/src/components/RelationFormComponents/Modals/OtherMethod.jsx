import React, { useState, useEffect } from "react";

export default function OtherMethod({
  isOpen,
  onClose,
  onSubmit,
  initialMethod,
}) {
  const [otherMethod, setOtherMethod] = useState("");

  useEffect(() => {
    setOtherMethod(initialMethod || "");
  }, [initialMethod]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Specify Other Method</h2>
        <input
          type="text"
          className="block w-full border border-gray-300 p-2 mb-4"
          value={otherMethod}
          onChange={(e) => setOtherMethod(e.target.value)}
          placeholder="Enter method"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => onSubmit(otherMethod)}
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
