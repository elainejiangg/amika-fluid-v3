/**
 * This component represents a form for users to edit their personal information.
 * It allows users to update their first name, last name, pronouns, profile picture,
 * and interests. The component fetches existing user data from the backend and
 * submits updates to the user's profile.
 *
 * Key functionalities include:
 * - Fetching user information from the backend on component mount.
 * - Managing form state for user inputs.
 * - Validating and submitting updated user information to the backend.
 * - Displaying an overlay for tutorial instructions.
 *
 * The component utilizes React hooks for state management and side effects.
 */

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext"; // Import AuthContext to access user profile
import Overlay from "./Overlay"; // Import the Overlay component for user guidance
import { OverlayContext } from "../OverlayProvider"; // Import OverlayContext for managing overlay state

export default function UserInfoForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    pronouns: "",
    picture: "",
    interests: "",
  }); // State to hold form data
  const navigate = useNavigate(); // Hook to programmatically navigate
  const { profile } = useContext(AuthContext); // Access user profile from AuthContext
  const { overlayStep, setOverlayStep } = useContext(OverlayContext); // Access overlay context for tutorial steps

  // Instructions for the user
  const instructions = [
    "This is the form to edit your user information.",
    "Fill in your first name.",
    "Fill in your last name.",
    "Specify your pronouns.",
    "Upload a picture.",
    "Provide your interests.",
  ];

  // Fetch user information from the backend when the component mounts
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch(
          `http://localhost:5050/users/${profile.id}/info`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user information"); // Throw error if response is not ok
        }

        const userInfo = await response.json(); // Parse response data
        setForm({
          first_name: userInfo.first_name || "", // Set first name
          last_name: userInfo.last_name || "", // Set last name
          pronouns: userInfo.pronouns || "", // Set pronouns
          picture: userInfo.picture || "", // Set picture URL
          interests: userInfo.interests || "", // Set interests
        });
      } catch (error) {
        console.error("A problem occurred fetching the user info: ", error); // Log error
      }
    }

    if (profile) {
      fetchUserInfo(); // Call fetchUserInfo function if profile exists
    }
  }, [profile]); // Dependency on profile to refetch if it changes

  // Function to update form state
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value }; // Merge previous form state with new values
    });
  }

  // Function to handle form submission
  async function onSubmit(e) {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/info`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form), // Send updated form data as JSON
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Throw error if response is not ok
      }
    } catch (error) {
      console.error("A problem occurred updating the user info: ", error); // Log error
    } finally {
      navigate("/relations"); // Navigate to relations page after submission
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

  // Render the component
  return (
    <>
      {overlayStep !== null && (
        <Overlay
          step={overlayStep} // Current step of the overlay
          onNext={handleNext} // Function to go to the next step
          onSkip={handleSkip} // Function to skip the overlay
          instructions={instructions} // Instructions to display in the overlay
        />
      )}
      <h3 className="text-lg font-semibold p-4">Edit User Info</h3>
      <form
        onSubmit={onSubmit} // Handle form submission
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
                value={form.first_name} // Bind input value to form state
                onChange={(e) => updateForm({ first_name: e.target.value })} // Update first name on change
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
                value={form.last_name} // Bind input value to form state
                onChange={(e) => updateForm({ last_name: e.target.value })} // Update last name on change
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
                value={form.pronouns} // Bind input value to form state
                onChange={(e) => updateForm({ pronouns: e.target.value })} // Update pronouns on change
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
                value={form.picture} // Bind input value to form state
                onChange={(e) => updateForm({ picture: e.target.value })} // Update picture URL on change
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {form.picture && (
                <div className="mt-4 w-24">
                  <img
                    src={form.picture} // Display uploaded picture
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
                value={form.interests} // Bind input value to form state
                onChange={(e) => updateForm({ interests: e.target.value })} // Update interests on change
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <input
          type="submit"
          value="Save Info" // Submit button to save user info
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
        />
      </form>
    </>
  );
}
