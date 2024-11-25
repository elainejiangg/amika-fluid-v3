import React, { useState, useEffect, useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function Login() {
  const [user, setUser] = useState(null);
  const { profile, setProfile } = useContext(AuthContext);
  const [fromLink, setFromLink] = useState(false);
  const [promptChatMsg, setPromptChatMsg] = useState(null);
  const [newUser, setNewUser] = useState(false);

  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed: ", error),
  });

  //login via jwt token link sent to email
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

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
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();
          if (data.success) {
            const googleId = data.user.googleId;
            setPromptChatMsg(
              "Pretend this is an email you sent to the user. Continue the conversation as Amika (NOTE: not as in email format but in a conversationally chat with the user/the person that the email is addressed to), inquiring about their recent interactions with the specified relation or if they did not interact with the specified relation suggest ways that the user can contact them (conversations for example). Treat this as the start of a new conversation. The following is the email and the last line is whether the user has interacted with the specified relation. Again, do not respond in an email format" +
                data.user.emailContent
            );
            console.log("GOOGLE ID: ", googleId);
            console.log("EMAIL CONTENTS: ", promptChatMsg);
            console.log("EMAIL BODY: ", data.user.emailContent);

            const userInfoResponse = await fetch(
              `http://localhost:5050/users/${googleId}/info`
            );
            console.log("USER INFO: ", userInfoResponse);
            const userInfo = await userInfoResponse.json();
            console.log("***userInfo: ", userInfo);
            await setProfile({
              id: googleId,
              name: userInfo.name,
              email: userInfo.email,
              picture: "test",
            });

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
            console.log("PRFOILE", profile);
            // setUser({ access_token: token });
            setFromLink(true);
          } else {
            console.log("Token verification failed");
          }
        } catch (error) {
          console.log("Error verifying token: ", error);
        }
      })();
    }
  }, []);

  // ! Should check if on chat page first
  useEffect(() => {
    if (promptChatMsg) {
      console.log("22 EMAIL CONTENTS: ", promptChatMsg);
      navigate("/chat", { state: { promptChatMsg } });
    }
  }, [promptChatMsg, navigate]);

  //regular login
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          console.log("Access Token:", user.access_token);
          const response = await fetch(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
            {
              headers: {
                Authorization: `Bearer ${user.access_token}`,
                Accept: "application/json",
              },
            }
          );
          const data = await response.json();

          // Check if user is new
          const isNewResponse = await fetch(
            `http://localhost:5050/users/${data.id}/isNew`
          );
          const isNewData = await isNewResponse.json();

          setProfile(data);

          // Call the new route to store the user profile
          await fetch("http://localhost:5050/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              googleId: data.id,
              name: data.name,
              email: data.email,
              picture: data.picture,
            }),
          });

          try {
            await fetch(`http://localhost:5050/users/${data.id}/thread_ids`, {
              method: "POST",
            });
          } catch (err) {
            console.log(`ERROR GENERATING NEW THREAD IDS ${err}`);
          }
        } catch (err) {
          console.log(`ERROR GETTING PROFILE FROM GOOGLE API ${err}`);
        }
      };

      fetchUserProfile();
    }
  }, [user]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-gradient-to-tr from-indigo-100 via-white to-blue-100">
      <h1
        className="font-black text-5xl lg:text-6xl text-indigo-950 wildy-sans"
        style={{ fontFamily: "Wildly Sans, sans-serif" }}
      >
        Amika
      </h1>

      {profile == null && !fromLink && !newUser ? (
        <>
          <button
            onClick={() => login()}
            className="w-1/6 min-w-56  mt-4 mb-0 lg:mt-5 items-center justify-center bg-sky-950 font-bold text-white border border-slate-200 hover:border-blue-200 rounded-xl px-4 py-1 hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
          >
            Sign in with Google
          </button>
          <button
            onClick={() => login()}
            className="mt-2 w-1/6 min-w-56 items-center justify-center bg-sky-950 font-bold text-white border border-slate-200 hover:border-blue-200 rounded-xl px-4 py-1 hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
          >
            Create an account with Google
          </button>
        </>
      ) : (
        navigate("/relations")
      )}

      {fromLink && navigate("/chat")}
    </div>
  );
}

export default Login;
