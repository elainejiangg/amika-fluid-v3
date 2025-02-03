/**
 * This component represents the user registration interface for new users.
 * It allows users to input their personal information, including their name,
 * pronouns, profile picture, and interests. The component handles form submission
 * and communicates with the backend to create a new user account.
 *
 * Key functionalities include:
 * - Managing form state and validation.
 * - Sending user data to the backend for account creation.
 * - Navigating users to the chat interface upon successful registration.
 * - Displaying error messages for invalid input or submission failures.
 *
 * The component utilizes React hooks for state management and side effects.
 */

import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext"; // Import AuthContext for user authentication
import { OverlayContext } from "../OverlayProvider"; // Import OverlayContext

export default function NewUser() {
  const { profile } = useContext(AuthContext); // Access user profile from AuthContext
  const { startOverlaySequence } = useContext(OverlayContext); // Use OverlayContext
  const navigate = useNavigate(); // Hook to programmatically navigate
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    pronouns: "<they/them>",
    picture: "",
    interests: "",
  }); // State to hold form data
  const [error, setError] = useState(""); // State to hold error messages

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Update form data state
  };

  const getGoogleDriveImageUrl = (url) => {
    const match = url.match(/\/d\/(.*?)\//);
    if (match) {
      const imageUrl = `https://drive.google.com/thumbnail?id=${match[1]}`;
      console.log("Constructed Google Drive Image URL:", imageUrl);
      return imageUrl;
    }
    return url;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await fetch("http://localhost:5050/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          googleId: profile.id, // Include Google ID from profile
          email: profile.email, // Include email from profile
          ...formData, // Include form data
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user account"); // Throw error if response is not ok
      }

      const data = await response.json(); // Parse response data
      console.log("User created successfully:", data);
      await fetch(`http://localhost:5050/users/${profile.id}/thread_ids`, {
        method: "POST",
      });
      console.log("User and thread IDs created successfully");
      startOverlaySequence(); // Start overlay sequence using context
      navigate("/chat"); // Navigate to chat interface upon successful registration
    } catch (err) {
      console.error("Error creating user:", err);
      setError("Failed to create user account. Please try again."); // Set error message
    }
  };

  const isFormValid = () => {
    return formData.first_name.trim() !== "";
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-gradient-to-tr from-indigo-200 via-white to-violet-100">
      <h1 className="font-black text-5xl text-sky-950 wildy-sans">
        Create Your Account
      </h1>
      {error && <p className="text-red-500">{error}</p>}{" "}
      {/* Display error message if exists */}
      <form
        onSubmit={handleSubmit} // Handle form submission
        className="flex flex-col w-1/2 mt-4"
      >
        <label className="text-lg">
          First Name:
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange} // Handle input changes
            required
            className="border rounded p-2 mt-1"
          />
        </label>
        <label className="text-lg mt-2">
          Last Name:
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange} // Handle input changes
            required
            className="border rounded p-2 mt-1"
          />
        </label>
        <label className="text-lg mt-2">
          Pronouns:
          <input
            type="text"
            name="pronouns"
            value={formData.pronouns}
            onChange={handleChange} // Handle input changes
            className="border rounded p-2 mt-1"
          />
        </label>
        <label className="text-lg mt-2">
          Profile Picture URL:
          <input
            type="text"
            name="picture"
            value={formData.picture}
            onChange={handleChange} // Handle input changes
            className="border rounded p-2 mt-1"
          />
        </label>
        <label className="text-lg mt-2">
          Interests:
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange} // Handle input changes
            className="border rounded p-2 mt-1"
          />
        </label>
        <button
          type="submit"
          disabled={!isFormValid()}
          className="mt-4 py-2 bg-sky-950 text-white rounded-lg"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
