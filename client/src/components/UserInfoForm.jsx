import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import Overlay from "./Overlay"; // Import the Overlay component
import { OverlayContext } from "../OverlayProvider";

export default function UserInfoForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    pronouns: "",
    picture: "",
    interests: "",
  });
  const navigate = useNavigate();
  const { profile, setProfile } = useContext(AuthContext);
  const { overlayStep, setOverlayStep } = useContext(OverlayContext); // Use OverlayContext

  const instructions = [
    "This is the form to edit your user information.",
    "Fill in your first name.",
    "Fill in your last name.",
    "Specify your pronouns.",
    "Upload a picture.",
    "Provide your interests.",
  ];

  const getGoogleDriveImageUrl = (url) => {
    const match = url.match(/\/d\/(.*?)\//);
    if (match) {
      const imageUrl = `https://drive.google.com/thumbnail?id=${match[1]}`;
      console.log("Constructed Google Drive Image URL:", imageUrl);
      return imageUrl;
    }
    return url;
  };

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch(
          `http://localhost:5050/users/${profile.id}/info`
        );

        const userInfo = await response.json();
        setForm({
          first_name: userInfo.first_name || "",
          last_name: userInfo.last_name || "",
          pronouns: userInfo.pronouns || "",
          picture: userInfo.picture || "",
          interests: userInfo.interests || "",
        });
      } catch (error) {
        console.error("A problem occurred fetching the user info: ", error);
      }
    }

    if (profile) {
      fetchUserInfo();
    }
  }, [profile]);

  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/info`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("A problem occurred updating the user info: ", error);
    } finally {
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

  return (
    <>
      {overlayStep !== null && (
        <Overlay
          step={overlayStep}
          onNext={handleNext}
          onSkip={handleSkip}
          instructions={instructions}
        />
      )}
      <h3 className="text-lg font-semibold p-4">Edit User Info</h3>
      <form
        onSubmit={onSubmit}
        className="border rounded-lg overflow-hidden p-4"
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-slate-900/10 pb-12 md:grid-cols-2">
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900">
              User Info
            </h2>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={(e) => updateForm({ first_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={(e) => updateForm({ last_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pronouns
              </label>
              <input
                type="text"
                name="pronouns"
                value={form.pronouns}
                onChange={(e) => updateForm({ pronouns: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Picture
              </label>
              <p className="text-[11px]">
                (For Google drive, ensure that access is set to 'Anyone with the
                link' and set to 'Viewer. Link should look like
                https://drive.google.com/file/d/file_id/view?usp=sharing ')
              </p>
              <input
                type="text"
                name="picture"
                value={form.picture}
                onChange={(e) => updateForm({ picture: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interests
              </label>
              <input
                type="text"
                name="interests"
                value={form.interests}
                onChange={(e) => updateForm({ interests: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <input
          type="submit"
          value="Save Info"
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
        />
      </form>
    </>
  );
}
