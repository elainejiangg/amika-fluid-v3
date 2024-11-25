import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import Name from "./RelationFormComponents/Name";
import Pronouns from "./RelationFormComponents/Pronouns";
import Overview from "./RelationFormComponents/Overview";
import RelationshipType from "./RelationFormComponents/RelationshipType";
import ContactHistory from "./RelationFormComponents/ContactHistory";
// import ContactFrequency from "./RelationFormComponents/ContactFrequency";
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
  });
  const [isNew, setIsNew] = useState(true); // identifies if creating new record
  const params = useParams();
  const navigate = useNavigate();
  const { profile } = useContext(AuthContext);

  const { overlayStep, setOverlayStep } = useContext(OverlayContext); // Use OverlayContext
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

  useEffect(() => {
    async function fetchData() {
      const id = params.id?.toString() || undefined;
      if (!id) return;
      setIsNew(false);
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations/${id}`
      );
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const record = await response.json();
      if (!record) {
        console.warn(`Record with id ${id} not found`);
        navigate("/relations");
        return;
      }
      setForm(record);
    }
    fetchData();
  }, [params.id, navigate, profile]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

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

      const ruleOptions = {
        freq: parseInt(freqItem.frequency, 10),
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
      const rule = new RRule(ruleOptions);
      return rule.all();
    }
  };

  async function onSubmit(e) {
    e.preventDefault();
    const relation = { ...form };
    // Generate occurrences for each reminder
    relation.reminder_frequency = relation.reminder_frequency.map(
      (reminder) => ({
        ...reminder,
        occurrences: generateOccurrences(reminder),
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
            body: JSON.stringify(relation),
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
            body: JSON.stringify(relation),
          }
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("A problem occurred adding or updating a record: ", error);
    } finally {
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
      navigate("/relations");
    }
  }

  const handleNext = () => {
    if (overlayStep < instructions.length - 1) {
      setOverlayStep(overlayStep + 1);
    } else {
      setOverlayStep(0);
      navigate("/settings");
    }
  };

  const handleSkip = () => {
    setOverlayStep(null); // Hide overlay
  };

  // This following section will display the form that takes the input from the user.
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
