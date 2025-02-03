/**
 * This module provides the context for managing overlay instructions in the application.
 * It allows components to start and stop overlay sequences, as well as track the current
 * step in the overlay.
 *
 * Key functionalities include:
 * - Creating a context for overlay management.
 * - Providing a provider component to wrap the application and manage overlay state.
 * - Allowing components to access and control the overlay sequence.
 *
 * The component utilizes React's Context API for state management.
 */

import { createContext, useState } from "react";

export const OverlayContext = createContext(); // Create the OverlayContext

export const OverlayProvider = ({ children }) => {
  const [overlayStep, setOverlayStep] = useState(null); // State to track the current overlay step

  // Function to start the overlay sequence
  const startOverlaySequence = () => {
    setOverlayStep(0); // Set the overlay step to the first step
    localStorage.setItem("showOverlaySequence", "true"); // Store overlay visibility in local storage
  };

  // Function to stop the overlay sequence
  const stopOverlaySequence = () => {
    setOverlayStep(null); // Reset the overlay step
    localStorage.removeItem("showOverlaySequence"); // Remove overlay visibility from local storage
  };

  return (
    <OverlayContext.Provider
      value={{
        overlayStep, // Current overlay step
        setOverlayStep, // Function to set the overlay step
        startOverlaySequence, // Function to start the overlay sequence
        stopOverlaySequence, // Function to stop the overlay sequence
      }}
    >
      {children} {/* Render child components */}
    </OverlayContext.Provider>
  );
};
