import React from "react";

export default function Picture({ form, updateForm }) {
  const getGoogleDriveImageUrl = (url) => {
    const match = url.match(/\/d\/(.*?)\//);
    if (match) {
      const imageUrl = `https://drive.google.com/thumbnail?id=${match[1]}`;
      console.log("Constructed Google Drive Image URL:", imageUrl);
      return imageUrl;
    }
    return url;
  };
  return (
    <div className="sm:col-span-4">
      <label
        htmlFor="pronouns"
        className="block text-sm font-medium leading-6 text-slate-900"
      >
        Picture
      </label>
      <p className="text-[11px]">
        (For Google drive, ensure that access is set to 'Anyone with the link'
        and set to 'Viewer. Link should look like
        https://drive.google.com/file/d/file_id/view?usp=sharing ')
      </p>
      <div className="mt-2">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            name="pronouns"
            id="pronouns"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="Link to picture "
            value={form.picture}
            onChange={(e) => updateForm({ picture: e.target.value })}
            autocomplete="off"
          />
        </div>
      </div>
      {form.picture && (
        <div className="mt-4 w-24">
          <img
            src={getGoogleDriveImageUrl(form.picture)}
            alt="Uploaded"
            className="max-w-full h-auto"
          />
        </div>
      )}
    </div>
  );
}
