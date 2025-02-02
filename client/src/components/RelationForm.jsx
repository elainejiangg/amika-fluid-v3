/**
 * This component provides a form interface for users to create or edit their relations.
 * It allows users to input details such as name, picture, pronouns, relationship type,
 * contact frequency, and reminders. The component handles form submission and validation,
 * and communicates with the backend to save the relation data.
 *
 * Key functionalities include:
 * - Managing form state and validation for user inputs.
 * - Fetching existing relation data for editing purposes.
 * - Sending relation data to the backend for creation or updates.
 * - Handling reminders and contact frequency settings.
 *
 * The component utilizes React hooks for state management and side effects.
 */

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import Name from "./RelationFormComponents/Name";
import Pronouns from "./RelationFormComponents/Pronouns";
import Overview from "./RelationFormComponents/Overview";
import RelationshipType from "./RelationFormComponents/RelationshipType";
import ContactHistory from "./RelationFormComponents/ContactHistory";
import ReminderEnabled from "./RelationFormComponents/ReminderEnabled";
import ContactFrequency from "./RelationFormComponents/ContactFrequency";
import ReminderFrequency from "./RelationFormComponents/ReminderFrequency";
import Picture from "./RelationFormComponents/Picture";
import { RRule } from "rrule";
import Overlay from "./Overlay"; // Import the Overlay component
import { OverlayContext } from "../OverlayProvider";

// RRule.DAILY    // 3
// RRule.WEEKLY   // 2
// RRule.MONTHLY  // 1
// RRule.YEARLY   // 0

// component to help display each record in the recordlist
export default function RelationForm() {
  const [form, setForm] = useState({
    name: "",
    picture: "",
    pronouns: "<they/them>",
    relationship_type: "",
    contact_frequency: [],
    overview: "",
    contact_history: [],
    reminder_frequency: [],
    reminder_enabled: false,
  }); // State to hold form data
  const [isNew, setIsNew] = useState(true); // State to track if the form is for a new relation
  const params = useParams(); // Get URL parameters
  const navigate = useNavigate(); // Hook to programmatically navigate
  const { profile } = useContext(AuthContext); // Access user profile from AuthContext
  const { overlayStep, setOverlayStep } = useContext(OverlayContext); // Access overlay context

  const instructions = [
    "This is the form you will reach after clicking '+'. Here, you can manually input information about a relation!",
    "You can fill out your relation's name, upload a picture for the relation, specify their pronouns, describe the relationship type, provide an overview of the relation, set the contact history and frequency, enable reminders if needed",
  ];

  const getOverlayClassName = (step) => {
    switch (step) {
      case 0:
        return "absolute top-1/4 mt-4 left-1/4 transform -translate-y-3/4 flex justify-center";
      case 1:
        return "absolute top-1/4 mt-8 left-1/4 transform -translate-y-3/4 flex justify-center";
      case 2:
        return "absolute bottom-0 right-0 transform -translate-x-1/4 mb-4 flex justify-center";
    }
  };

  // Function to fetch existing relation data for editing
  useEffect(() => {
    async function fetchData() {
      const id = params.id?.toString() || undefined; // Get relation ID from URL
      if (!id) return; // Exit if no ID is provided
      setIsNew(false); // Set form to edit mode
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations/${id}`
      );

      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return; // Exit if response is not ok
      }

      const record = await response.json(); // Parse response data
      if (!record) {
        console.warn(`Record with id ${id} not found`);
        navigate("/relations"); // Navigate back if record not found
        return;
      }

      setForm(record); // Set form data with fetched record
    }
    fetchData(); // Call fetchData function
  }, [params.id, navigate, profile]); // Dependencies for useEffect

  // Function to update form state
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value }; // Merge previous form state with new values
    });
  }

  // Function to generate occurrences for reminders
  const generateOccurrences = (reminder) => {
    const freqItem = reminder.frequency;
    if (!freqItem) return []; // Return empty array if no frequency item

    if (freqItem.frequency === "Custom") {
      const customOccurrences = [];
      let currentDate = new Date(freqItem.startDate);
      while (currentDate <= freqItem.endDate) {
        customOccurrences.push(new Date(currentDate)); // Add current date to occurrences
        currentDate.setDate(
          currentDate.getDate() + freqItem.customRecurrence.num // Increment date by custom recurrence
        );
      }
      return customOccurrences; // Return custom occurrences
    } else {
      const freqStartDate = new Date(freqItem.startDate);
      const freqTime = new Date(freqItem.time);
      const freqEndDate = new Date(freqItem.endDate);

      const ruleOptions = {
        freq: parseInt(freqItem.frequency, 10), // Parse frequency
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
      const rule = new RRule(ruleOptions); // Create RRule instance
      return rule.all(); // Return all occurrences
    }
  };

  // Function to handle form submission
  async function onSubmit(e) {
    e.preventDefault(); // Prevent default form submission behavior
    const relation = { ...form }; // Create a copy of the form data
    // Generate occurrences for each reminder
    relation.reminder_frequency = relation.reminder_frequency.map(
      (reminder) => ({
        ...reminder,
        occurrences: generateOccurrences(reminder), // Generate occurrences for reminders
      })
    );

    try {
      let response;
      if (isNew) {
        response = await fetch(
          `http://localhost:5050/users/${profile.id}/relations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(relation), // Send relation data as JSON
          }
        );
      } else {
        response = await fetch(
          `http://localhost:5050/users/${profile.id}/relations/${params.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(relation), // Send updated relation data as JSON
          }
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Throw error if response is not ok
      }
    } catch (error) {
      console.error("A problem occurred adding or updating a record: ", error); // Log error
    } finally {
      // Reset form state after submission
      setForm({
        name: "",
        picture: "",
        pronouns: "<they/them>",
        relationship_type: "",
        contact_frequency: [],
        overview: "",
        contact_history: [],
        reminder_frequency: [],
        reminder_enabled: false,
      });
      navigate("/relations"); // Navigate back to relations page
    }
  }

  // Function to handle next step in overlay instructions
  const handleNext = () => {
    if (overlayStep < instructions.length - 1) {
      setOverlayStep(overlayStep + 1); // Increment overlay step
    } else {
      setOverlayStep(0); // Reset overlay step
      navigate("/settings"); // Navigate to settings page
    }
  };

  // Function to skip overlay instructions
  const handleSkip = () => {
    setOverlayStep(null); // Hide overlay
  };

  // Render the form
  return (
    <>
      {overlayStep !== null && (
        <Overlay
          step={overlayStep}
          onNext={handleNext}
          onSkip={handleSkip}
          instructions={instructions}
          className={getOverlayClassName(overlayStep)}
        />
      )}
      <h3 className="text-lg font-semibold p-4">Relation Form</h3>
      <form
        onSubmit={onSubmit}
        className="border rounded-lg overflow-hidden p-4"
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-slate-900/10 pb-12 md:grid-cols-2">
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900">
              Relation Info
            </h2>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8">
            <Name form={form} updateForm={updateForm} />
            <Picture form={form} updateForm={updateForm} />
            <Pronouns form={form} updateForm={updateForm} />
            <RelationshipType form={form} updateForm={updateForm} />
            <Overview form={form} updateForm={updateForm} />
            <ReminderEnabled form={form} updateForm={updateForm} />
            <ContactHistory
              history={form.contact_history}
              setHistory={(newHistory) =>
                updateForm({ contact_history: newHistory })
              }
            />
            <ContactFrequency
              contactFrequencyPairs={form.contact_frequency}
              setContactFrequencyPairs={(pairs) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  contact_frequency: pairs,
                }))
              }
            />

            <ReminderFrequency
              reminderTriples={form.reminder_frequency}
              setReminderTriples={(triples) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  reminder_frequency: triples,
                }))
              }
            />
          </div>
        </div>
        <input
          type="submit"
          value="Save Relation"
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
        />
      </form>
    </>
  );
}
