// import React, { useState } from "react";
// import DateSelector from "./Modals/DateSelector";

// const methods = ["Text", "Call", "Email", "In-Person", "Other"];

// export default function ContactHistory({ history = [], setHistory }) {
//   const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(null);
//   const [initialDate, setInitialDate] = useState(new Date());

//   const handleDateChange = (index, date) => {
//     const newHistory = [...history];
//     newHistory[index].date = date;
//     setHistory(newHistory);
//   };

//   const handleTopicChange = (index, value) => {
//     const newHistory = [...history];
//     newHistory[index].topic = value;
//     setHistory(newHistory);
//   };

//   const handleMethodChange = (index, value) => {
//     const newHistory = [...history];
//     newHistory[index].method = value;
//     setHistory(newHistory);
//   };

//   const addHistoryItem = () => {
//     setHistory([...history, { date: "", topic: "", method: "" }]);
//   };

//   const removeHistoryItem = (index) => {
//     const newHistory = history.filter((_, i) => i !== index);
//     setHistory(newHistory);
//   };

//   const handleDatePickerSubmit = (date) => {
//     handleDateChange(currentIndex, date);
//     setIsDatePickerOpen(false);
//   };

//   return (
//     <div className="sm:col-span-4">
//       <label
//         htmlFor="contactHistory"
//         className="block text-sm font-medium leading-6 text-slate-900"
//       >
//         Contact History
//       </label>

//       <table className="min-w-full divide-y divide-gray-200">
//         <thead>
//           <tr>
//             <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Date
//             </th>
//             <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Topic
//             </th>
//             <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Method
//             </th>
//             <th className="px-6 py-3 bg-gray-50"></th>
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {history.map((item, index) => (
//             <tr key={index}>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <button
//                   type="button"
//                   className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
//                   onClick={() => {
//                     setCurrentIndex(index);
//                     setInitialDate(item.date || new Date());
//                     setIsDatePickerOpen(true);
//                   }}
//                 >
//                   {item.date
//                     ? new Date(item.date).toLocaleDateString()
//                     : "Select Date"}
//                 </button>
//                 <button className="px-6 py-1 align-left text-xs font-medium text-gray-500 tracking-wider">
//                   Custom
//                 </button>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <input
//                   type="text"
//                   className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
//                   value={item.topic}
//                   onChange={(e) => handleTopicChange(index, e.target.value)}
//                   placeholder="Enter topic"
//                 />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <select
//                   className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
//                   value={item.method} // Ensure this value is correctly bound
//                   onChange={(e) => handleMethodChange(index, e.target.value)}
//                 >
//                   <option value="">Select Method</option>
//                   {methods.map((method) => (
//                     <option key={method} value={method}>
//                       {method}
//                     </option>
//                   ))}
//                 </select>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                 <button
//                   type="button"
//                   className="text-red-600 hover:text-red-900"
//                   onClick={() => removeHistoryItem(index)}
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <button
//         type="button"
//         className="mt-4 text-sm font-semibold leading-6 text-blue-600"
//         onClick={addHistoryItem}
//       >
//         Add Contact Instance
//       </button>

//       <DateSelector
//         isOpen={isDatePickerOpen}
//         onClose={() => setIsDatePickerOpen(false)}
//         onSubmit={handleDatePickerSubmit}
//         initialDate={initialDate}
//         showTimeSelect={false}
//       />
//     </div>
//   );
// }

import React, { useState } from "react";
import DateSelector from "./Modals/DateSelector";
import CustomDateModal from "./Modals/CustomDate"; // Import the new modal

const methods = ["Text", "Call", "Email", "In-Person", "Other"];

export default function ContactHistory({ history = [], setHistory }) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false); // State for custom date modal
  const [currentIndex, setCurrentIndex] = useState(null);
  const [initialDate, setInitialDate] = useState(new Date());

  const handleDateChange = (index, date) => {
    const newHistory = [...history];
    newHistory[index].date = date;
    setHistory(newHistory);
  };

  const handleTopicChange = (index, value) => {
    const newHistory = [...history];
    newHistory[index].topic = value;
    setHistory(newHistory);
  };

  const handleMethodChange = (index, value) => {
    const newHistory = [...history];
    newHistory[index].method = value;
    setHistory(newHistory);
  };

  const addHistoryItem = () => {
    setHistory([...history, { date: "", topic: "", method: "" }]);
  };

  const removeHistoryItem = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
  };

  const handleDatePickerSubmit = (date) => {
    handleDateChange(currentIndex, date);
    setIsDatePickerOpen(false);
  };

  const handleCustomDateSubmit = (customDate) => {
    const formattedDate =
      typeof customDate === "string"
        ? customDate.charAt(0).toUpperCase() + customDate.slice(1)
        : customDate;
    handleDateChange(currentIndex, formattedDate);
  };

  return (
    <div className="sm:col-span-4">
      <label
        htmlFor="contactHistory"
        className="block text-sm font-medium leading-6 text-slate-900"
      >
        Contact History
      </label>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Topic
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method of Contact
            </th>
            <th className="px-6 py-3 bg-gray-50"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {history.map((item, index) => (
            <tr key={index}>
              <td className="px-6 pb-0 pt-6 whitespace-nowrap">
                <button
                  type="button"
                  className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  onClick={() => {
                    setCurrentIndex(index);
                    setInitialDate(item.date || new Date());
                    setIsDatePickerOpen(true);
                  }}
                >
                  {item.date instanceof Date
                    ? new Date(item.date).toLocaleDateString()
                    : typeof item.date === "string" && item.date.trim() !== ""
                    ? item.date
                    : "Select Date"}
                </button>
                <button
                  type="button"
                  className="mt-0 px-0.5 pb-2 font-bold align-left text-xs text-blue-500 tracking-wider "
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsCustomDateModalOpen(true);
                  }}
                >
                  Custom Time
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={item.topic}
                  onChange={(e) => handleTopicChange(index, e.target.value)}
                  placeholder="Enter topic"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={item.method}
                  onChange={(e) => handleMethodChange(index, e.target.value)}
                >
                  <option value="">Select Method</option>
                  {methods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  type="button"
                  className="text-red-600 hover:text-red-900"
                  onClick={() => removeHistoryItem(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="mt-4 text-sm font-semibold leading-6 text-blue-600"
        onClick={addHistoryItem}
      >
        + Add Contact Instance
      </button>

      <DateSelector
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSubmit={handleDatePickerSubmit}
        initialDate={initialDate}
        showTimeSelect={false}
      />

      <CustomDateModal
        isOpen={isCustomDateModalOpen}
        onClose={() => setIsCustomDateModalOpen(false)}
        onSubmit={handleCustomDateSubmit}
      />
    </div>
  );
}
