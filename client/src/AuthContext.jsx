/**
 * This module provides the authentication context for the application.
 * It manages the user's authentication state and provides methods to
 * update the user's profile information.
 *
 * Key functionalities include:
 * - Creating a context for user authentication.
 * - Providing a provider component to wrap the application and manage user state.
 * - Allowing components to access and update user profile information.
 *
 * The component utilizes React's Context API for state management.
 */

import React, { createContext, useState } from "react";

export const AuthContext = createContext(); // Create the AuthContext

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null); // State to hold user profile information

  return (
    <AuthContext.Provider value={{ profile, setProfile }}>
      {children} {/* Render child components */}
    </AuthContext.Provider>
  );
};
