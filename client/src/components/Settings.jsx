import React, { useState, useEffect, useContext } from "react";
import CustomRecurrence from "./RelationFormComponents/Modals/CustomRecurrence";
import DatePicker from "react-datepicker";
import { RRule } from "rrule";
import "react-datepicker/dist/react-datepicker.css";
import OtherMethod from "./RelationFormComponents/Modals/OtherMethod";
import { AuthContext } from "../AuthContext";
import { OverlayContext } from "../OverlayProvider";
import Overlay from "./Overlay"; // Import the Overlay component

const reminderOptions = [
  "None",
  "Second",
  "Minute",
  "Daily",
  "Weekly",
  "Monthly",
  "Custom",
];
const methodOptions = ["In-Person", "Text", "Call", "Other"];

const parseReminders = (remindersString) => {
  if (!remindersString) return [];
  return remindersString.split(", ").map((reminder) => {
    const [method, ...timeParts] = reminder.split(" ");
    const time = timeParts.join(" ");
    return { method, time, showOtherMethodInput: method === "Other" };
  });
};

const stringifyReminders = (remindersArray) => {
  return remindersArray
    .map(({ method, time }) => `${method} ${time}`)
    .join(", ");
};

const Settings = () => {
  const [relations, setRelations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const [isCustomRecurrenceModalOpen, setIsCustomRecurrenceModalOpen] =
    useState(false);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [initialRecurrence, setInitialRecurrence] = useState({
    num: 1,
    unit: "day",
  });
  const [initialMethod, setInitialMethod] = useState("");
  const [currentRelationIndex, setCurrentRelationIndex] = useState(null);
  const [currentReminderIndex, setCurrentReminderIndex] = useState(null);
  const { profile } = useContext(AuthContext); // get user relation
  const [errors, setErrors] = useState({}); // for validating reminder start and end dates
  const [changedRelations, setChangedRelations] = useState({});

  const { overlayStep, setOverlayStep } = useContext(OverlayContext); // Use OverlayContext
  const instructions = [
    "This is your settings page.",
    "You can view and manage your reminders here.",
    "You can also edit the email that you receive these reminders at.",
    "That's it, you're ready to go! Go ahead and start adding relations or start chat away with me! ",
    "P.S if you ever need this demo again, press on the '?' in the navbar.",
    "Good-Bye for now!",
  ];

  // Method to fetch all relations from the database.
  useEffect(() => {
    async function getRelations() {
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations`
      );
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const relationsResponse = await response.json();

      setRelations(relationsResponse);
    }
    getRelations();
    console.log("RELATIONS___-: ", relations);
  }, [profile]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const saveReminderChanges = async (updatedRelation) => {
    try {
      console.log("Saving reminder changes for relation:", updatedRelation);
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations/${updatedRelation._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedRelation),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", response.status, errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      console.log("Reminder updated successfully");
    } catch (error) {
      console.error("Error updating reminder:", error);
      throw error;
    }
  };

  const handleUpdateEmail = async () => {
    // const newEmail = e.target.value;
    // setEmail(newEmail);

    try {
      console.log(profile.id);
      console.log("NEW EMAIL:", email);
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/email`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setOriginalEmail(email);
      console.log("Email updated successfully");
    } catch (error) {
      console.error("Error updating email:", error);
      // Optionally, you can set an error state here to display to the user
    }
  };

  const handleCheckboxChange = async (index) => {
    const updatedRelations = [...relations];
    const updatedRelation = {
      ...updatedRelations[index],
      reminders_enabled: !updatedRelations[index].reminders_enabled,
    };
    updatedRelations[index] = updatedRelation;
    setRelations(updatedRelations);
    await handleSave(updatedRelation);
  };

  const handleReminderChange = (relationIndex, reminderIndex, key, value) => {
    const newRelations = [...relations];
    if (key === "frequency") {
      newRelations[relationIndex].reminder_frequency[reminderIndex].frequency =
        {
          ...newRelations[relationIndex].reminder_frequency[reminderIndex]
            .frequency,
          ...value,
        };
      // Call validateDates after updating the frequency
      validateDates(relationIndex, reminderIndex);
      console.log("Validation complete");
    } else {
      newRelations[relationIndex].reminder_frequency[reminderIndex][key] =
        value;
    }
    setRelations(newRelations);
    setChangedRelations((prev) => ({ ...prev, [relationIndex]: true }));
  };

  const handleSave = async (relation) => {
    try {
      const relationToSave = {
        ...relation,
        reminders: stringifyReminders(relation.reminders),
      };
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations/${relation._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(relationToSave),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating relation:", error);
    }
  };

  const filteredRelations = relations.filter((relation) =>
    relation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //COMPONENTS:
  const AddReminderButton = ({ onClick }) => (
    <tr>
      <td colSpan="4 " className="text-right">
        <button
          className="text-blue-500 hover:text-blue-700"
          type="button"
          onClick={onClick}
        >
          + Add Reminder
        </button>
      </td>
    </tr>
  );
  useEffect(() => {
    // Fetch the user's current email when the component mounts
    async function fetchUserEmail() {
      try {
        const response = await fetch(
          `http://localhost:5050/users/${profile.id}/info`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        setEmail(userData.email);
        setOriginalEmail(userData.email);
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    }
    fetchUserEmail();
  }, [profile.id]);

  const validateDates = (relationIndex, reminderIndex) => {
    const reminder = relations[relationIndex].reminder_frequency[reminderIndex];
    const { startDate, endDate } = reminder.frequency;
    const newErrors = { ...errors };
    const errorKey = `${relationIndex}-${reminderIndex}`;
    console.log(
      "Validating dates for relation:",
      relationIndex,
      "reminder:",
      reminderIndex
    );

    console.log("Start date:", startDate);
    console.log("End date:", endDate);

    if (startDate > endDate) {
      newErrors[errorKey] = "Start date cannot be after end date.";
      handleReminderChange(relationIndex, reminderIndex, "frequency", {
        ...reminder.frequency,
        startDate: endDate,
      });
      console.log("Start date cannot be after end date.");
    } else if (endDate < startDate) {
      newErrors[errorKey] = "End date cannot be before start date.";
      handleReminderChange(relationIndex, reminderIndex, "frequency", {
        ...reminder.frequency,
        endDate: startDate,
      });
      console.log("End date cannot be before start date.");
    } else {
      delete newErrors[errorKey];
    }
    console.log(newErrors);
    setErrors(newErrors);
  };

  const handleMethodChange = (relationIndex, reminderIndex, value) => {
    const updatedRelations = [...relations];
    updatedRelations[relationIndex].reminder_frequency[reminderIndex].method =
      value;
    setRelations(updatedRelations);

    // Mark this relation as changed
    setChangedRelations((prev) => ({ ...prev, [relationIndex]: true }));
  };

  const handleConfirmChanges = async (relationIndex) => {
    const hasErrors = Object.keys(errors).some((key) =>
      key.startsWith(`${relationIndex}-`)
    );
    if (hasErrors) {
      console.error("Cannot save changes due to validation errors");
      // Optionally, show an error message to the user
      return;
    }

    try {
      const updatedRelation = { ...relations[relationIndex] };

      // Generate occurrences for each reminder
      updatedRelation.reminder_frequency =
        updatedRelation.reminder_frequency.map((reminder) => ({
          ...reminder,
          occurrences: generateOccurrences(reminder),
        }));

      console.log("Updated relation:", updatedRelation);

      await saveReminderChanges(updatedRelation);
      console.log("Changes saved successfully");

      // Update the local state with the new occurrences
      setRelations((prevRelations) => {
        const newRelations = [...prevRelations];
        newRelations[relationIndex] = updatedRelation;
        return newRelations;
      });

      setChangedRelations((prev) => {
        const newChangedRelations = { ...prev };
        delete newChangedRelations[relationIndex];
        return newChangedRelations;
      });

      // Optionally, show a success message to the user
    } catch (error) {
      console.error("Error saving changes:", error);
      // Show an error message to the user
    }
  };

  const generateOccurrences = (reminder) => {
    const freqItem = reminder.frequency;
    if (!freqItem) return [];

    if (freqItem.frequency === "Custom") {
      const customOccurrences = [];
      let currentDate = new Date(freqItem.startDate);
      while (currentDate <= freqItem.endDate) {
        customOccurrences.push(new Date(currentDate));
        currentDate.setDate(
          currentDate.getDate() + freqItem.customRecurrence.num
        );
      }
      return customOccurrences;
    } else {
      const freqStartDate = new Date(freqItem.startDate);
      const freqTime = new Date(freqItem.time);
      const freqEndDate = new Date(freqItem.endDate);

      let freq;

      switch (freqItem.frequency.toString()) {
        case RRule.DAILY.toString():
          freq = RRule.DAILY;
          break;
        case RRule.WEEKLY.toString():
          freq = RRule.WEEKLY;
          break;
        case RRule.MONTHLY.toString():
          freq = RRule.MONTHLY;
          break;
        default:
          console.error("Invalid frequency:", freqItem.frequency);
          return [];
      }

      const ruleOptions = {
        freq: freq,
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
          parseInt(freqItem.frequency, 10) === RRule.WEEKLY.toString()
            ? freqItem.weekdays
                .map((val, i) => val && RRule.weekdays[i])
                .filter(Boolean)
            : null,
      };
      console.log("RULE OPTIONS", ruleOptions);
      const rule = new RRule(ruleOptions);
      console.log("ALL", rule.all());
      return rule.all();
    }
  };

  const handleAddReminder = (relationIndex) => {
    const newRelations = [...relations];
    const newReminder = {
      method: "",
      frequency: {
        frequency: RRule.DAILY,
        startDate: new Date(),
        endDate: new Date(),
        time: new Date(),
        weekdays: [false, false, false, false, false, false, false],
        customRecurrence: { num: 1, unit: "day" },
      },
      occurrences: [],
    };
    newReminder.occurrences = generateOccurrences(newReminder);
    newRelations[relationIndex].reminder_frequency.push(newReminder);
    setRelations(newRelations);
    setChangedRelations((prev) => ({ ...prev, [relationIndex]: true }));
  };

  const handleDeleteReminder = (relationIndex, reminderIndex) => {
    const newRelations = [...relations];
    newRelations[relationIndex].reminder_frequency.splice(reminderIndex, 1);
    setRelations(newRelations);
    setChangedRelations((prev) => ({ ...prev, [relationIndex]: true }));
  };

  const handleNext = () => {
    if (overlayStep < instructions.length - 1) {
      setOverlayStep(overlayStep + 1);
    } else {
      setOverlayStep(null);
    }
  };

  const handleSkip = () => {
    setOverlayStep(null);
  };

  const getOverlayClassName = (step) => {
    switch (step) {
      case 0:
        return "absolute top-1/8 left-1/2 transform mt-4 flex justify-center";
      case 1:
        return "absolute top-1/4 left-1/2 transform -translate-x-1/8 -translate-y-3/4 flex justify-center";
      case 2:
        return "absolute top-1/8 mt-4 left-1/2 transform flex justify-center";
      case 3:
        return "absolute top-1/8 left-1/2 transform mt-4 flex justify-center";
      case 4:
        return "absolute top-1/4 mt-32 ml-4 left-0 transform flex justify-center";
      case 5:
        return "absolute top-1/8 left-1/2 transform mt-4 flex justify-center items-center text-center";
    }
  };

  return (
    <div className="flex flex-col h-full pl-3 w-full lg:w-3/4 max-w-screen-lg ">
      {overlayStep !== null && (
        <Overlay
          step={overlayStep}
          onNext={handleNext}
          onSkip={handleSkip}
          instructions={instructions}
          className={getOverlayClassName(overlayStep)}
        />
      )}
      <div className="mb-4 bg-gradient-to-t from-indigo-100 from-10% via-blue-50 to-sky-50 p-5 rounded-xl">
        <h1 className="font-bold mb-2 text-lg">Account Info</h1>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email for notifications
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          className="mt-1 p-2  rounded w-1/3 min-w-64 mb-4"
        />
        {email !== originalEmail && (
          <button
            onClick={handleUpdateEmail}
            className="ml-2 bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Change Email
          </button>
        )}
      </div>

      <div className="bg-gradient-to-t from-indigo-100 from-10% via-blue-50 to-sky-50 p-5 rounded-xl">
        <h1 className="font-bold mb-2 text-lg">Reminder Notifications</h1>

        <input
          type="text"
          placeholder="Search relations... (Type a name)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1  mb-4 p-2 rounded w-1/2 min-w-64 mb-4"
        />
        <div className="overflow-y-scroll max-h-[600px] bg-white px-6 rounded-lg">
          <table className="min-w-full text-left ">
            <thead className=" border-b border-slate-300 sticky top-0 z-10 pt-2 bg-white">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2 text-center">Enabled</th>
                <th className="pl-6 py-2 ">Reminders</th>
              </tr>
            </thead>
            <tr className="h-px bg-gray-200"></tr>
            <tbody className="bg-white divide-y divide-slate-300 ">
              {filteredRelations.map((relation, relationIndex) => (
                <tr key={relation._id}>
                  <td className="py-2">{relation.name}</td>
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      checked={relation.reminder_enabled}
                      onChange={() => handleCheckboxChange(relationIndex)}
                    />
                  </td>
                  <td>
                    {relation.reminder_frequency ? (
                      <table>
                        {relation.reminder_frequency.length > 0 && (
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Method
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Frequency
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                          </thead>
                        )}
                        <tbody>
                          {relation.reminder_frequency.map(
                            (reminder, reminderIndex) => (
                              <tr key={reminderIndex}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <select
                                    name="reminderMethod"
                                    id="reminderMethod"
                                    className="block w-full border border-gray-300 bg-white py-1 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    value={reminder.method}
                                    onChange={(e) =>
                                      handleMethodChange(
                                        relationIndex,
                                        reminderIndex,
                                        e.target.value
                                      )
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
                                      selected={
                                        new Date(reminder.frequency?.startDate)
                                      }
                                      onChange={(date) =>
                                        handleReminderChange(
                                          relationIndex,
                                          reminderIndex,
                                          "frequency",
                                          { startDate: date.toISOString() }
                                        )
                                      }
                                      showYearDropdown
                                      showMonthDropdown
                                      dateFormat="P"
                                    />
                                  </div>
                                  <div>
                                    <label>End Date:</label>
                                    <DatePicker
                                      selected={
                                        new Date(reminder.frequency?.endDate)
                                      }
                                      onChange={(date) =>
                                        handleReminderChange(
                                          relationIndex,
                                          reminderIndex,
                                          "frequency",
                                          { endDate: date.toISOString() }
                                        )
                                      }
                                      showYearDropdown
                                      showMonthDropdown
                                      dateFormat="P"
                                    />
                                  </div>
                                  {errors[
                                    `${relationIndex}-${reminderIndex}`
                                  ] && (
                                    <div className="text-red-500 text-sm">
                                      {
                                        errors[
                                          `${relationIndex}-${reminderIndex}`
                                        ]
                                      }
                                    </div>
                                  )}
                                  <div>
                                    <label>Frequency:</label>
                                    <select
                                      value={reminder.frequency?.frequency}
                                      onChange={(e) =>
                                        handleReminderChange(
                                          relationIndex,
                                          reminderIndex,
                                          "frequency",
                                          {
                                            ...reminder.frequency,
                                            frequency: e.target.value,
                                          }
                                        )
                                      }
                                    >
                                      <option value={RRule.DAILY}>Daily</option>
                                      <option value={RRule.WEEKLY}>
                                        Weekly
                                      </option>
                                      <option value={RRule.MONTHLY}>
                                        Monthly
                                      </option>
                                      <option value="Custom">Custom</option>
                                    </select>
                                  </div>
                                  {reminder.frequency?.frequency ===
                                    "Custom" && (
                                    <div>
                                      <label>Custom Recurrence:</label>
                                      <input
                                        type="number"
                                        value={
                                          reminder.frequency?.customRecurrence
                                            .num
                                        }
                                        onChange={(e) =>
                                          handleReminderChange(
                                            relationIndex,
                                            reminderIndex,
                                            "frequency",
                                            {
                                              ...reminder.frequency,
                                              customRecurrence: {
                                                ...reminder.frequency
                                                  .customRecurrence,
                                                num: e.target.value,
                                              },
                                            }
                                          )
                                        }
                                      />
                                      <select
                                        value={
                                          reminder.frequency?.customRecurrence
                                            .unit
                                        }
                                        onChange={(e) =>
                                          handleReminderChange(
                                            relationIndex,
                                            reminderIndex,
                                            "frequency",
                                            {
                                              ...reminder.frequency,
                                              customRecurrence: {
                                                ...reminder.frequency
                                                  .customRecurrence,
                                                unit: e.target.value,
                                              },
                                            }
                                          )
                                        }
                                      >
                                        <option value="day">Day(s)</option>
                                        <option value="week">Week(s)</option>
                                        <option value="month">Month(s)</option>
                                      </select>
                                    </div>
                                  )}
                                  {reminder.frequency?.frequency ===
                                    RRule.WEEKLY.toString() && (
                                    <div>
                                      <label>Repeat on:</label>
                                      {["S", "M", "T", "W", "T", "F", "S"].map(
                                        (day, dayIndex) => (
                                          <label key={dayIndex}>
                                            <input
                                              type="checkbox"
                                              checked={
                                                reminder.frequency?.weekdays[
                                                  dayIndex
                                                ]
                                              }
                                              onChange={() => {
                                                const newWeekdays = [
                                                  ...reminder.frequency
                                                    .weekdays,
                                                ];
                                                newWeekdays[dayIndex] =
                                                  !newWeekdays[dayIndex];
                                                handleReminderChange(
                                                  relationIndex,
                                                  reminderIndex,
                                                  "frequency",
                                                  {
                                                    ...reminder.frequency,
                                                    weekdays: newWeekdays,
                                                  }
                                                );
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
                                      selected={
                                        new Date(reminder.frequency?.time)
                                      }
                                      onChange={(date) =>
                                        handleReminderChange(
                                          relationIndex,
                                          reminderIndex,
                                          "frequency",
                                          {
                                            ...reminder.frequency,
                                            time: date,
                                          }
                                        )
                                      }
                                      showTimeSelect
                                      showTimeSelectOnly
                                      timeIntervals={15}
                                      timeCaption="Time"
                                      dateFormat="h:mm aa"
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
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
                                          reminderIndex,
                                          "showAll",
                                          !reminder.showAll
                                        )
                                      }
                                    >
                                      {reminder.showAll
                                        ? "Show Less"
                                        : "Show All"}
                                    </button>
                                  )}
                                </div> */}
                                </td>
                                <td>
                                  <button
                                    className="text-red-500"
                                    type="button"
                                    onClick={() =>
                                      handleDeleteReminder(
                                        relationIndex,
                                        reminderIndex
                                      )
                                    }
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                          <AddReminderButton
                            key="add-reminder"
                            onClick={() => handleAddReminder(relationIndex)}
                          />
                        </tbody>
                        {changedRelations[relationIndex] && (
                          <tr>
                            <td colSpan="3">
                              <button
                                onClick={() =>
                                  handleConfirmChanges(relationIndex)
                                }
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
                              >
                                Confirm Changes
                              </button>
                            </td>
                          </tr>
                        )}
                      </table>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
