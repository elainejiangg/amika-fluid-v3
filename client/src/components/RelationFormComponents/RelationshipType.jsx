import React, { useState } from "react";
import OtherRelationshipTypeModal from "./Modals/OtherRelationshipType";

export default function RelationshipType({ form, updateForm }) {
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [initialType, setInitialType] = useState("");

  const handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === "Other") {
      setInitialType(form.relationship_type);
      setIsOtherModalOpen(true);
    } else {
      updateForm({ relationship_type: value });
    }
  };

  const handleOtherModalSubmit = (otherType) => {
    updateForm({ relationship_type: otherType });
    setIsOtherModalOpen(false);
  };

  return (
    <div className="sm:col-span-4">
      <label
        htmlFor="relationshipType"
        className="block text-sm font-medium leading-6 text-slate-900"
      >
        Relationship Type
      </label>
      <select
        id="relationshipType"
        name="relationshipType"
        className="mt-2 block w-full border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        value={form.relationship_type}
        onChange={handleTypeChange}
      >
        <option value="">Select Relationship Type</option>
        <option value="Friend">Friend</option>
        <option value="Family">Family</option>
        <option value="Colleague">Colleague</option>
        <option value="Acquaintance">Acquaintance</option>
        {/* Display custom option if written*/}
        <option value="Other">Other</option>
        {form.relationship_type &&
          form.relationship_type !== "Acquaintance" &&
          form.relationship_type !== "Friend" &&
          form.relationship_type !== "Family" &&
          form.relationship_type !== "Other" &&
          form.relationship_type !== "Colleague" && (
            <option value={form.relationship_type}>
              {form.relationship_type}
            </option>
          )}
      </select>

      <OtherRelationshipTypeModal
        isOpen={isOtherModalOpen}
        onClose={() => setIsOtherModalOpen(false)}
        onSubmit={handleOtherModalSubmit}
        initialType={initialType}
      />
    </div>
  );
}
