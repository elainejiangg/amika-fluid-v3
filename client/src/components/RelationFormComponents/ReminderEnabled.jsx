import React from "react";

export default function ReminderEnabled({ form, updateForm }) {
  return (
    <div className="sm:col-span-4 flex flex-row">
      <label
        htmlFor="reminderEnabled"
        className="block text-sm font-medium leading-6 text-slate-900"
      >
        Reminder Enabled
      </label>

      <div className="mx-2">
        <input
          type="checkbox"
          name="reminderEnabled"
          id="reminderEnabled"
          placeholder="First Last"
          checked={form.reminder_enabled}
          onChange={(e) => updateForm({ reminder_enabled: e.target.checked })}
          autocomplete="off"
        />
      </div>
    </div>
  );
}
