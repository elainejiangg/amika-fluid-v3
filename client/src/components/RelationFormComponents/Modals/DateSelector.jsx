import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateSelector({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  showTimeSelect = true,
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());

  const handleSubmit = () => {
    onSubmit(selectedDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Select Date</h2>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect={showTimeSelect}
          timeIntervals={15}
          timeFormat="hh:mm a"
          timeInputLabel="Time:"
          dateFormat={showTimeSelect ? "Pp" : "P"}
          inline
        />
        <button
          className="mx-4 bg-blue-500 text-white px-4 py-2 rounded mr-2"
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
