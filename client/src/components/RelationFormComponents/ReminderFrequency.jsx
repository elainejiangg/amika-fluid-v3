import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { RRule } from "rrule";
import "react-datepicker/dist/react-datepicker.css";
import CustomRecurrence from "./Modals/CustomRecurrence";
import isEqual from "lodash.isequal";
import cloneDeep from "lodash.clonedeep";

// RRule.DAILY    // 3
// RRule.WEEKLY   // 2
// RRule.MONTHLY  // 1
// RRule.YEARLY   // 0

export default function ReminderFrequency({
  reminderTriples,
  setReminderTriples,
}) {
  const [errors, setErrors] = useState({});

  const handleAddReminder = () => {
    const freqItem = {
      startDate: new Date(),
      endDate: new Date(),
      frequency: RRule.DAILY,
      weekdays: [false, false, false, false, false, false, false],
      time: new Date(),
      customRecurrence: { num: 1, unit: "day" },
      customRecurrenceText: "",
      error: "",
    };
    setReminderTriples([
      ...reminderTriples,
      {
        method: "",
        frequency: freqItem,
        occurrences: [],
      },
    ]);
  };

  const handleDeleteReminder = (index) => {
    setReminderTriples(reminderTriples.filter((_, i) => i !== index));
  };

  const handleReminderChange = (index, key, value) => {
    const newReminders = [...reminderTriples];
    newReminders[index][key] = value;
    setReminderTriples(newReminders);
  };

  const validateDates = (index) => {
    const reminder = reminderTriples[index];
    const { startDate, endDate } = reminder.frequency;
    const newErrors = { ...errors };

    if (startDate > endDate) {
      newErrors[index] = "Start date cannot be after end date.";
      handleReminderChange(index, "frequency", {
        ...reminder.frequency,
        startDate: endDate,
      });
    } else if (endDate < startDate) {
      newErrors[index] = "End date cannot be before start date.";
      handleReminderChange(index, "frequency", {
        ...reminder.frequency,
        endDate: startDate,
      });
    } else {
      delete newErrors[index];
    }

    setErrors(newErrors);
  };

  ///
  const generateOccurrences = (index) => {
    console.log("*****GENERATE OCCURRENCES");
    const reminder = reminderTriples[index];
    const freqItem = reminder.frequency;
    if (!freqItem) return;

    if (freqItem.frequency === "Custom") {
      const customOccurrences = [];
      let currentDate = new Date(freqItem.startDate);
      while (currentDate <= freqItem.endDate) {
        customOccurrences.push(new Date(currentDate));
        currentDate.setDate(
          currentDate.getDate() + freqItem.customRecurrence.num
        );
      }
      handleReminderChange(index, "occurrences", {
        ...freqItem,
        customOccurrences,
      });
    } else {
      const freqStartDate = new Date(freqItem.startDate);
      const freqTime = new Date(freqItem.time);
      const freqEndDate = new Date(freqItem.endDate);

      const ruleOptions = {
        freq: freqItem.frequency,
        dtstart: new Date(
          freqStartDate.getFullYear(),
          freqStartDate.getMonth(),
          freqStartDate.getDate(),
          freqTime.getHours(),
          freqTime.getMinutes()
        ),
        until: new Date(
          freqEndDate.getFullYear(),
          freqEndDate.getMonth(),
          freqEndDate.getDate(),
          freqTime.getHours(),
          freqTime.getMinutes()
        ),
        byweekday:
          freqItem.frequency === RRule.WEEKLY
            ? freqItem.weekdays
                .map((val, i) => val && RRule.weekdays[i])
                .filter(Boolean)
            : null,
      };
      const rule = new RRule(ruleOptions);
      console.log("___rule: ", rule.all());
      handleReminderChange(index, "occurrences", rule.all());
    }
  };
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-slate-900">
        Reminder Frequency
      </label>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Frequency
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reminderTriples.map((reminder, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  name="reminderMethod"
                  id="reminderMethod"
                  className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={reminder.method}
                  onChange={(e) =>
                    handleReminderChange(index, "method", e.target.value)
                  }
                >
                  <option value="">Select Method</option>
                  <option value="Call">Call</option>
                  <option value="Text">Text</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Other">Other</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <label>Start Date:</label>
                  <DatePicker
                    selected={reminder.frequency?.startDate}
                    onChange={(date) => {
                      handleReminderChange(index, "frequency", {
                        ...reminder.frequency,
                        startDate: date,
                      });
                      validateDates(index);
                    }}
                    showYearDropdown
                    showMonthDropdown
                    dateFormat="P"
                  />
                </div>
                <div>
                  <label>End Date:</label>
                  <DatePicker
                    selected={reminder.frequency?.endDate}
                    onChange={(date) => {
                      handleReminderChange(index, "frequency", {
                        ...reminder.frequency,
                        endDate: date,
                      });
                      validateDates(index);
                    }}
                    showYearDropdown
                    showMonthDropdown
                    dateFormat="P"
                  />
                </div>
                {errors[index] && (
                  <div className="text-red-500 text-sm">{errors[index]}</div>
                )}
                <div>
                  <label>Frequency:</label>
                  <select
                    value={reminder.frequency?.frequency}
                    onChange={(e) =>
                      handleReminderChange(index, "frequency", {
                        ...reminder.frequency,
                        frequency: e.target.value,
                      })
                    }
                  >
                    <option value={RRule.DAILY}>Daily</option>
                    <option value={RRule.WEEKLY}>Weekly</option>
                    <option value={RRule.MONTHLY}>Monthly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                {reminder.frequency?.frequency === "Custom" && (
                  <div>
                    <label>Custom Recurrence:</label>
                    <input
                      type="number"
                      value={reminder.frequency?.customRecurrence.num}
                      onChange={(e) =>
                        handleReminderChange(index, "frequency", {
                          ...reminder.frequency,
                          customRecurrence: {
                            ...reminder.frequency.customRecurrence,
                            num: e.target.value,
                          },
                        })
                      }
                    />
                    <select
                      value={reminder.frequency?.customRecurrence.unit}
                      onChange={(e) =>
                        handleReminderChange(index, "frequency", {
                          ...reminder.frequency,
                          customRecurrence: {
                            ...reminder.frequency.customRecurrence,
                            unit: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="day">Day(s)</option>
                      <option value="week">Week(s)</option>
                      <option value="month">Month(s)</option>
                    </select>
                  </div>
                )}
                {reminder.frequency?.frequency === RRule.WEEKLY.toString() && (
                  <div>
                    <label>Repeat on:</label>
                    {["S", "M", "T", "W", "T", "F", "S"].map(
                      (day, dayIndex) => (
                        <label key={dayIndex}>
                          <input
                            type="checkbox"
                            checked={reminder.frequency?.weekdays[dayIndex]}
                            onChange={() => {
                              const newWeekdays = [
                                ...reminder.frequency.weekdays,
                              ];
                              newWeekdays[dayIndex] = !newWeekdays[dayIndex];
                              handleReminderChange(index, "frequency", {
                                ...reminder.frequency,
                                weekdays: newWeekdays,
                              });
                            }}
                          />
                          {day}
                        </label>
                      )
                    )}
                  </div>
                )}
                <div>
                  <label>Time:</label>
                  <DatePicker
                    selected={new Date(reminder.frequency?.time)}
                    onChange={(date) =>
                      handleReminderChange(index, "frequency", {
                        ...reminder.frequency,
                        time: date,
                      })
                    }
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                  />
                </div>
                {/* <div>
                  <h3>Occurrences:</h3>
                  <ul>
                    {(reminder.showAll
                      ? reminder.occurrences
                      : reminder.occurrences?.slice(0, 3)
                    )?.map((date, dateIndex) => {
                      const dateObject = new Date(date);
                      return (
                        <li key={dateIndex}>
                          {dateObject.toLocaleDateString([], {
                            weekday: "short",
                          })}{" "}
                          {dateObject.toLocaleDateString()}{" "}
                          {dateObject.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}{" "}
                        </li>
                      );
                    })}
                  </ul>
                  {reminder.occurrences?.length > 3 && (
                    <button
                      className="text-blue-500"
                      type="button"
                      onClick={() =>
                        handleReminderChange(
                          index,
                          "showAll",
                          !reminder.showAll
                        )
                      }
                    >
                      {reminder.showAll ? "Show Less" : "Show All"}
                    </button>
                  )}
                </div> */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  className="text-red-500"
                  type="button"
                  onClick={() => handleDeleteReminder(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="text-blue-500"
        type="button"
        onClick={handleAddReminder}
      >
        + Add Reminder
      </button>
      <CustomRecurrence
        isOpen={reminderTriples.some(
          (reminder) => reminder.isCustomRecurrenceModalOpen
        )}
        onClose={() =>
          handleReminderChange(
            reminderTriples.findIndex(
              (reminder) => reminder.isCustomRecurrenceModalOpen
            ),
            "isCustomRecurrenceModalOpen",
            false
          )
        }
        onSubmit={(recurrence) => {
          const index = reminderTriples.findIndex(
            (reminder) => reminder.isCustomRecurrenceModalOpen
          );
          const updatedFrequency = {
            ...reminderTriples[index].frequency,
            customRecurrence: recurrence,
            frequency: "Custom",
            customRecurrenceText: `Every ${recurrence.num} ${recurrence.unit}${
              recurrence.num > 1 ? "s" : ""
            }`,
          };
          handleReminderChange(index, "frequency", updatedFrequency);
          handleReminderChange(index, "isCustomRecurrenceModalOpen", false);
        }}
        initialRecurrence={
          reminderTriples.find(
            (reminder) => reminder.isCustomRecurrenceModalOpen
          )?.frequency.customRecurrence || { num: 1, unit: "day" }
        }
      />
    </div>
  );
}
