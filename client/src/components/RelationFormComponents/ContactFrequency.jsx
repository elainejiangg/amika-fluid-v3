import React, { useState } from "react";
import OtherMethod from "./Modals/OtherMethod";
import CustomRecurrence from "./Modals/CustomRecurrence";

export default function ContactFrequency({
  contactFrequencyPairs,
  setContactFrequencyPairs,
}) {
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [isCustomRecurrenceModalOpen, setIsCustomRecurrenceModalOpen] =
    useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [initialMethod, setInitialMethod] = useState("");
  const [initialRecurrence, setInitialRecurrence] = useState({
    num: 1,
    unit: "day",
  });
  const frequencyMap = {
    "Every 1 day": "Daily",
    "Every 1 week": "Weekly",
    "Every 1 month": "Monthly",
    "Every 1 year": "Annually",
  };

  const mapFrequency = (frequency) => {
    return frequencyMap[frequency] || frequency;
  };

  const handleFrequencyChange = (index, value) => {
    const newPairs = [...contactFrequencyPairs];
    newPairs[index].frequency = value;
    setContactFrequencyPairs(newPairs);

    if (value === "Custom") {
      setCurrentIndex(index);
      setInitialRecurrence(
        newPairs[index].recurrence || { num: 1, unit: "day" }
      );
      setIsCustomRecurrenceModalOpen(true);
    }
  };

  const handleMethodChange = (index, value) => {
    const newPairs = [...contactFrequencyPairs];
    newPairs[index].method = value;
    newPairs[index].showOtherMethodInput = value === "Other";
    setContactFrequencyPairs(newPairs);

    if (value === "Other") {
      setCurrentIndex(index);
      setInitialMethod(newPairs[index].method);
      setIsOtherModalOpen(true);
    }
  };

  const handleOtherModalSubmit = (otherMethod) => {
    const newPairs = [...contactFrequencyPairs];
    newPairs[currentIndex].method = otherMethod;
    newPairs[currentIndex].showOtherMethodInput = false;
    setContactFrequencyPairs(newPairs);
    setIsOtherModalOpen(false);
  };

  const handleCustomRecurrenceSubmit = (recurrence) => {
    const newPairs = [...contactFrequencyPairs];
    const rawFreq = `Every ${recurrence.num} ${recurrence.unit}${
      recurrence.num > 1 ? "s" : ""
    }`;
    newPairs[currentIndex].frequency = mapFrequency(rawFreq);
    newPairs[currentIndex].recurrence = recurrence;
    setContactFrequencyPairs(newPairs);
    setIsCustomRecurrenceModalOpen(false);
  };

  const addContactFrequencyPair = () => {
    setContactFrequencyPairs([
      ...contactFrequencyPairs,
      { time: "", method: "", showOtherMethodInput: false },
    ]);
  };

  const removeContactFrequencyPair = (index) => {
    const newPairs = contactFrequencyPairs.filter((_, i) => i !== index);
    setContactFrequencyPairs(newPairs);
  };

  return (
    <div className="sm:col-span-4">
      <label
        htmlFor="contactFrequency"
        className="block text-sm font-medium leading-6 text-slate-900"
      >
        Contact Frequency
      </label>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Frequency
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method of Contact
            </th>
            <th className="px-6 py-3 bg-gray-50"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {contactFrequencyPairs.map((pair, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  name={`contactFrequencyTime-${index}`}
                  id={`contactFrequencyTime-${index}`}
                  className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={mapFrequency(pair.frequency)}
                  onChange={(e) => handleFrequencyChange(index, e.target.value)}
                >
                  <option value="">Select Time</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Annually">Annually</option>
                  <option value="Custom">Custom</option>
                  {pair.frequency && pair.frequency.startsWith("Every") && (
                    <option value={pair.frequency}>{pair.frequency}</option>
                  )}
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  name={`contactFrequencyMethod-${index}`}
                  id={`contactFrequencyMethod-${index}`}
                  className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={pair.method}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "Other" && pair.method === "Other") {
                      setCurrentIndex(index);
                      setInitialMethod(pair.method);
                      setIsOtherModalOpen(true);
                    } else {
                      handleMethodChange(index, value);
                    }
                  }}
                >
                  <option value="">Select Method</option>
                  <option value="In-person">In-person</option>
                  <option value="Text">Text</option>
                  <option value="Call">Call</option>
                  <option value="Other">Other</option>
                  {pair.method &&
                    pair.method !== "In-person" &&
                    pair.method !== "Text" &&
                    pair.method !== "Call" &&
                    pair.method !== "Other" && (
                      <option value={pair.method}>{pair.method}</option>
                    )}
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  type="button"
                  className="text-red-600 hover:text-red-900"
                  onClick={() => removeContactFrequencyPair(index)}
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
        onClick={addContactFrequencyPair}
      >
        + Add Contact Frequency
      </button>

      <OtherMethod
        isOpen={isOtherModalOpen}
        onClose={() => setIsOtherModalOpen(false)}
        onSubmit={handleOtherModalSubmit}
        initialMethod={initialMethod}
      />

      <CustomRecurrence
        isOpen={isCustomRecurrenceModalOpen}
        onClose={() => setIsCustomRecurrenceModalOpen(false)}
        onSubmit={handleCustomRecurrenceSubmit}
        initialRecurrence={initialRecurrence}
      />
    </div>
  );
}
