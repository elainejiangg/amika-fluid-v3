/**
 * Login.jsx
 *
 * This component represents the login interface for users to authenticate
 * using Google or a JWT token link. It manages user state, handles login
 * processes, and navigates users to the appropriate pages based on their
 * authentication status.
 *
 * Key functionalities include:
 * - Managing user state and error messages.
 * - Handling login via Google OAuth and JWT token verification.
 * - Navigating users to different pages based on their login status.
 * - Displaying loading indicators and error messages during the login process.
 *
 * The component utilizes React hooks for state management and side effects.
 */

import React, { useState, useEffect, useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import AmikaFace from "../assets/Amika_face.png";

function Login() {
  const [user, setUser] = useState(null); // State to hold user information
  const { profile, setProfile } = useContext(AuthContext); // Access profile and setProfile from AuthContext
  const [fromLink, setFromLink] = useState(false); // State to track if login is from a link
  const [promptChatMsg, setPromptChatMsg] = useState(null); // State for chat prompt message
  const [newUser, setNewUser] = useState(false); // State to track if the user is new
  const [errorMsg, setErrorMsg] = useState(""); // State for error messages
  const [creatingAccount, setCreatingAccount] = useState(false); // State to track account creation
  const navigate = useNavigate(); // Hook to programmatically navigate

  // Google login configuration
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse), // Set user on successful login
    onError: (error) => console.log("Login Failed: ", error), // Log error on login failure
  });

  // Effect to handle login via JWT token link sent to email
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token"); // Extract token from URL parameters

    if (token) {
      // Use the token to authenticate the user
      (async () => {
        try {
          const response = await fetch(
            "http://localhost:5050/auth/verify-token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Set authorization header with token
              },
            }
          );

          const data = await response.json(); // Parse response data
          if (data.success) {
            const googleId = data.user.googleId; // Get Google ID from response
            setPromptChatMsg(
              "Pretend this is an email you sent to the user. Continue the conversation as Amika (NOTE: not as in email format but in a conversationally chat with the user/the person that the email is addressed to), inquiring about their recent interactions with the specified relation or if they did not interact with the specified relation suggest ways that the user can contact them (conversations for example). Treat this as the start of a new conversation. The following is the email and the last line is whether the user has interacted with the specified relation. Again, do not respond in an email format" +
                data.user.emailContent
            );
            console.log("GOOGLE ID: ", googleId);
            console.log("EMAIL CONTENTS: ", promptChatMsg);
            console.log("EMAIL BODY: ", data.user.emailContent);

            // Fetch user information using Google ID
            const userInfoResponse = await fetch(
              `http://localhost:5050/users/${googleId}/info`
            );
            const userInfo = await userInfoResponse.json();
            await setProfile({
              id: googleId,
              name: userInfo.name,
              email: userInfo.email,
              picture: "test", // Placeholder for user picture
            });

            // Fetch first and second thread IDs for the user
            await fetch(
              `http://localhost:5050/users/${googleId}/first_thread_id`,
              {
                method: "POST",
              }
            );

            await fetch(
              `http://localhost:5050/users/${googleId}/second_thread_id`,
              {
                method: "POST",
              }
            );
            setFromLink(true); // Set fromLink to true if login is successful
          } else {
            console.log("Token verification failed");
          }
        } catch (error) {
          console.log("Error verifying token: ", error);
        }
      })();
    }
  }, []); // Empty dependency array to run effect only once

  // Effect to navigate to chat page if promptChatMsg is set
  useEffect(() => {
    if (promptChatMsg) {
      navigate("/chat", { state: { promptChatMsg } }); // Navigate to chat with prompt message
    }
  }, [promptChatMsg, navigate]);

  // Effect to handle regular login
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
            {
              headers: {
                Authorization: `Bearer ${user.access_token}`,
                Accept: "application/json",
              },
            }
          );
          const data = await response.json(); // Parse user profile data

          // Check if user is new
          const isNewResponse = await fetch(
            `http://localhost:5050/users/${data.id}/isNew`
          );
          const isNewData = await isNewResponse.json();

          if (isNewData.isNew) {
            if (creatingAccount) {
              setNewUser(true); // Set newUser to true if creating account
              await setProfile({
                id: data.id,
                name: data.name,
                email: data.email,
                picture: data.picture,
              });
              navigate("/new-user"); // Navigate to new user page
            } else {
              setNewUser(true); // Set newUser to true if account exists
              setErrorMsg("No account found"); // Set error message
            }
          } else {
            if (creatingAccount) {
              setErrorMsg("Account already exists with user"); // Set error message for existing account
            } else {
              await setProfile({
                id: data.id,
                name: data.name,
                email: data.email,
                picture: data.picture,
              });
              navigate("/relations"); // Navigate to relations page
            }
          }
        } catch (err) {
          console.log(`ERROR GETTING PROFILE FROM GOOGLE API ${err}`);
        }
      };

      fetchUserProfile(); // Fetch user profile on successful login
    }
  }, [user]); // Dependency on user state

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-gradient-to-tr from-indigo-200 via-white to-violet-100">
      <div className="flex">
        <img
          src={AmikaFace}
          alt="Amika Face"
          className="w-20 h-20 mr-2 mt-10"
        />
        <h1
          className="font-black text-9xl lg:text-10xl text-sky-950 wildy-sans flex items-center"
          style={{ fontFamily: "Wildly Sans, sans-serif" }}
        >
          amika
        </h1>
      </div>
      <p
        className="text-center leading-4 text-2xl pb-2 w-1/2 min-w-96 tracking-tighter"
        style={{ fontFamily: "Wildly Sans, sans-serif" }}
      >
        your personal ai assistant to help you keep in touch with your Loved
        ones
      </p>
      {profile == null && !fromLink && !newUser ? (
        <>
          <button
            onClick={() => {
              setCreatingAccount(false); // Set creatingAccount to false for login
              login(); // Trigger Google login
            }}
            className="mt-4 py-2 w-1/6 min-w-56 leading-6 text-md -translate-y-3 mb-0 lg:mt-5 items-center justify-center bg-sky-950 font-bold text-white border border-slate-200 hover:border-blue-200 rounded-xl px-4 py-1 hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
          >
            Sign in with Google
          </button>
          <button
            onClick={() => {
              setCreatingAccount(true); // Set creatingAccount to true for account creation
              login(); // Trigger Google login
            }}
            className="py-2 text-md w-1/6 min-w-56 leading-6 mt-1 -translate-y-2 items-center justify-center bg-sky-950 font-bold text-white border border-slate-200 hover:border-blue-200 rounded-xl px-4 py-1 hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
          >
            Create an account with Google
          </button>
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}{" "}
          {/* Display error message if exists */}
        </>
      ) : (
        navigate(newUser ? "/new-user" : "/relations") // Navigate based on newUser state
      )}
      {fromLink && navigate("/chat")}{" "}
      {/* Navigate to chat if fromLink is true */}
    </div>
  );
}

export default Login;
