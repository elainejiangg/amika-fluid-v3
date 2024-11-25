// export default RelationRow;
import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { RRule } from "rrule";

const reminderFreqMap = {
  3: "Daily",
  2: "Weekly",
  1: "Monthly",
  0: "Yearly",
};

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// To display each relation row in the table
const RelationRow = (props) => {
  const [expandedReminders, setExpandedReminders] = useState({});
  const { profile } = useContext(AuthContext); // get user profile

  const getGoogleDriveImageUrl = (url) => {
    const match = url.match(/\/d\/(.*?)\//);
    if (match) {
      const imageUrl = `https://drive.google.com/thumbnail?id=${match[1]}`;
      console.log("Constructed Google Drive Image URL:", imageUrl);
      return imageUrl;
    }
    return url;
  };

  const toggleReminderDetails = (index) => {
    setExpandedReminders((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="m-1 p-0">
      <div className="flex flex-row justify-start h-24">
        <div className="flex bg-white w-1/4 rounded-2xl ml-2 mt-2 justify-center overflow-hidden">
          {props.relation.picture ? (
            <img
              // src="https://drive.google.com/thumbnail?id=13m-LgN_qlUIi1JHTNPjcgw0rDXjqEKQ1"
              src={getGoogleDriveImageUrl(props.relation.picture)}
              className=" w-full h-full object-cover"
              alt="Relation"
              onError={(e) => console.error("Image failed to load:", e)}
            />
          ) : (
            <svg
              className="w-full"
              viewBox="0 0 24 32"
              fill="lightgray"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="5" />
              <rect x="5" y="20" width="14" height="18" />
            </svg>
          )}
        </div>
        <div className=" w-3/4 pl-4 pt-2 overflow-y-scroll">
          <p className="font-bold text-md">
            {props.relation.name}{" "}
            {props.relation.pronouns &&
              props.relation.pronouns !== "<they/them>" && (
                <span className="font-normal text-sm">
                  ({props.relation.pronouns})
                </span>
              )}
          </p>
          <p className="text-sm">{props.relation.relationship_type}</p>
          <p className="text-sm">{props.relation.overview}</p>
        </div>
      </div>
      <div className="mt-5 bg-white rounded-xl h-52 overflow-y-scroll">
        <div className="p-4 ">
          <h2 className="font-bold">Info</h2>
          <ul className="list-disc ml-4 text-xs">
            {props.relation.contact_frequency[0] && (
              <li>
                <h3 className="font-bold">Contact Frequency:</h3>
                <ul className="list-disc ml-4">
                  {props.relation.contact_frequency.map((contact, index) => (
                    <li key={index}>
                      {contact.method} - {contact.frequency}
                    </li>
                  ))}
                </ul>
              </li>
            )}
            {props.relation.contact_history[0] && (
              <li>
                <h3 className="font-bold">Contact History:</h3>
                <ul className="list-disc ml-4">
                  {props.relation.contact_history.map((interaction, index) => (
                    <li key={index}>
                      {new Date(interaction.date).toLocaleString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      - {interaction.topic} - {interaction.method}
                    </li>
                  ))}
                </ul>
              </li>
            )}

            <li>
              <h3 className="font-bold">
                Reminder Enabled:{" "}
                <span className="font-normal">
                  {props.relation.reminder_enabled ? "Yes" : "No"}
                </span>
              </h3>
            </li>

            {props.relation.reminder_enabled && (
              <li>
                <h3 className="font-bold">Reminders:</h3>
                <ul className="list-disc ml-4">
                  {props.relation.reminder_frequency.map((reminder, index) => (
                    <li key={index}>
                      {reminder.method} -{" "}
                      {reminderFreqMap[reminder.frequency.frequency]}
                      {reminder.frequency.frequency ===
                        RRule.WEEKLY.toString() && (
                        <span>
                          {" "}
                          [
                          {reminder.frequency.weekdays
                            .map((isSelected, index) =>
                              isSelected ? weekdayNames[index] : null
                            )
                            .filter(Boolean)
                            .join(", ")}
                          ]
                        </span>
                      )}
                      <button
                        onClick={() => toggleReminderDetails(index)}
                        className="ml-2 text-blue-700 underline"
                      >
                        {expandedReminders[index] ? "Show Less" : "Show More"}
                      </button>
                      {expandedReminders[index] && (
                        <ul className="list-none pl-4 mt-1">
                          <li>
                            Start:{" "}
                            {new Date(
                              reminder.frequency.startDate
                            ).toLocaleString("en-US", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            })}
                          </li>
                          <li>
                            End:{" "}
                            {new Date(
                              reminder.frequency.endDate
                            ).toLocaleString("en-US", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            })}
                          </li>
                          <li>
                            Occurences:{" "}
                            {reminder.occurrences
                              .map((occurrence, index) =>
                                new Date(occurrence).toLocaleString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                })
                              )
                              .join(" | ")}
                          </li>
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="flex justify-between text-sm py-2 font-bold px-2">
        <span className="text-red-500 hover:text-pink-300">
          <button
            type="button"
            onClick={() => {
              props.deleteRelation(props.relation._id);
            }}
          >
            Delete
          </button>
        </span>
        <span className="text-blue-500 hover:text-cyan-300">
          <Link
            to={`/users/${profile.id}/relations/edit/${props.relation._id}`}
          >
            Edit
          </Link>
        </span>
      </div>
    </div>
  );
};

export default RelationRow;
