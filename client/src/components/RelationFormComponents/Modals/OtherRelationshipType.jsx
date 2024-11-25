import React, { useState, useEffect } from "react";

export default function OtherRelationshipType({
  isOpen,
  onClose,
  onSubmit,
  initialType,
}) {
  const [otherType, setOtherType] = useState("");

  useEffect(() => {
    if (initialType) {
      setOtherType(initialType);
    }
  }, [initialType]);

  const handleSubmit = () => {
    if (otherType.trim() === "") {
      alert("Please specify a relationship type.");
      return;
    }
    onSubmit(otherType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Specify Relationship Type
        </h2>
        <input
          type="text"
          className="border border-gray-300 p-2 w-full mb-4"
          value={otherType}
          onChange={(e) => setOtherType(e.target.value)}
          placeholder="Enter relationship type"
        />
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
