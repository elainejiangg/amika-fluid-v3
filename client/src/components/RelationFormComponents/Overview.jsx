import React from "react";

export default function Overview({ form, updateForm }) {
  return (
    <div className="sm:col-span-4">
      <label
        htmlFor="overview"
        className="block text-sm font-medium leading-6 text-slate-900"
      >
        Overview
      </label>
      <div className="mt-2">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            name="overview"
            id="overview"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="Overview"
            value={form.overview}
            onChange={(e) => {
              updateForm({ overview: e.target.value });
            }}
            autocomplete="off"
          />
        </div>
      </div>
    </div>
  );
}
