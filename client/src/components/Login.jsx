import React, { useState, useEffect, useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { set } from "lodash";
import AmikaFace from "../assets/Amika_face.png";

function Login() {
  const [user, setUser] = useState(null);
  const { profile, setProfile } = useContext(AuthContext);
  const [fromLink, setFromLink] = useState(false);
  const [promptChatMsg, setPromptChatMsg] = useState(null);
  const [newUser, setNewUser] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

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

  // Reset creatingAccount state when user changes
  // useEffect(() => {
  //   if (user) {
  //     setCreatingAccount(false);
  //   }
  // }, [user]);

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

          if (isNewData.isNew) {
            if (creatingAccount) {
              console.log("new account", creatingAccount);
              console.log("new user", newUser);

              setNewUser(true);
              // Call the new route to store the user profile
              // await fetch("http://localhost:5050/users", {
              //   method: "POST",
              //   headers: {
              //     "Content-Type": "application/json",
              //   },
              //   body: JSON.stringify({
              //     googleId: data.id,
              //     name: data.name,
              //     email: data.email,
              //     picture: data.picture,
              //   }),
              // });

              // try {
              //   await fetch(
              //     `http://localhost:5050/users/${data.id}/thread_ids`,
              //     {
              //       method: "POST",
              //     }
              //   );
              // } catch (err) {
              //   console.log(`ERROR GENERATING NEW THREAD IDS ${err}`);
              // }
              await setProfile({
                id: data.id,
                name: data.name,
                email: data.email,
                picture: data.picture,
              });
              console.log("PROFILE:", profile.email);
              navigate("/new-user");
            } else {
              setNewUser(true);
              setErrorMsg("No account found");
              set;
            }
          } else {
            if (creatingAccount) {
              setErrorMsg("Account already exists with user");
            } else {
              await setProfile({
                id: data.id,
                name: data.name,
                email: data.email,
                picture: data.picture,
              });
              navigate("/relations");
            }
          }
        } catch (err) {
          console.log(`ERROR GETTING PROFILE FROM GOOGLE API ${err}`);
        }
      };

      fetchUserProfile();
    }
  }, [user]);

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
        // className="px-8 py-4 flex text-center items-center mb-8 text-2xl text-sky-950 border rounded-md border-cyan-800 font-bold w-1/2 min-w-72"
        style={{ fontFamily: "Wildly Sans, sans-serif" }}
      >
        your personal ai assistant to help you keep in touch with your Loved
        ones
      </p>

      {profile == null && !fromLink && !newUser ? (
        <>
          <button
            onClick={() => {
              setCreatingAccount(false);
              login();
            }}
            className="mt-4 py-2 w-1/6 min-w-56 leading-6 text-md -translate-y-3 mb-0 lg:mt-5 items-center justify-center bg-sky-950 font-bold text-white border border-slate-200 hover:border-blue-200 rounded-xl px-4 py-1 hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
            // style={{ fontFamily: "Wildly Sans, sans-serif" }}
          >
            Sign in with Google
          </button>
          <button
            onClick={() => {
              setCreatingAccount(true);
              login();
            }}
            className="  py-2 text-md w-1/6 min-w-56 leading-6 mt-1 -translate-y-2 items-center justify-center bg-sky-950 font-bold text-white border border-slate-200 hover:border-blue-200 rounded-xl px-4 py-1 hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
            // style={{ fontFamily: "Wildly Sans, sans-serif" }}
          >
            Create an account with Google
          </button>
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        </>
      ) : (
        navigate(newUser ? "/new-user" : "/relations")
      )}
      {fromLink && navigate("/chat")}
    </div>
  );
}

export default Login;
