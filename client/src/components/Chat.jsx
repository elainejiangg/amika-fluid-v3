import React, { useState, useEffect, useRef, useContext } from "react";
import TypingIndicator from "./TypingIndicator";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../AuthContext";
import { useLocation, useNavigate } from "react-router-dom"; // Added import
import Overlay from "./Overlay"; // Import the Overlay component
import { OverlayContext } from "../OverlayProvider";
import AmikaFace from "../assets/Amika_face.png";

export default function Chat() {
  const navigate = useNavigate(); // Add this lin
  const location = useLocation(); // Added useLocation hook
  const [message, setMessage] = useState(null); // Initialize message with promptChatMsg (user input)
  const [chatHistory, setChatHistory] = useState(() => {
    // Retrieve chat history from sessionStorage if it exists
    const savedChatHistory = sessionStorage.getItem("chatHistory");
    return savedChatHistory ? JSON.parse(savedChatHistory) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const chatEndRef = useRef(null);
  const { profile } = useContext(AuthContext);
  const hasEffectRun = useRef(false); // Ref to track if the effect has run
  const [promptLoading, setPromptLoading] = useState(false);
  const { overlayStep, setOverlayStep } = useContext(OverlayContext); // Use OverlayContext'

  const instructions = [
    "Hello! I am AMIKA, an AI assistant that helps with tracking and maintaining your relationships with others.",
    "If you let me know about some friends, family, and other relationships, which I’ll generally call “relations,” I can help with remembering details, nudging you to reach out and suggestions about what to talk about, and offering a listening ear and conversation partner if you’d like to talk about them — whether you’re encountering some issues or just want to go over some memories.",
    "Here is the chat! This is where you can chat with me!",
    "Type your message in the input box below and press 'Enter' on your keyboard or the airplane button on your screen to send.",
  ];

  useEffect(() => {
    // Save chat history to sessionStorage whenever it updates
    sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // for email prompt
  useEffect(() => {
    if (
      !hasEffectRun.current &&
      location.state?.promptChatMsg &&
      profile &&
      profile.id
    ) {
      setPromptLoading(true);
      handleSendInitialPrompt(location.state?.promptChatMsg);
      hasEffectRun.current = true;
    }
  }, [profile]);

  const getOverlayPosition = (step) => {
    switch (step) {
      case 2: // "Here is the chat! This is where you can chat with me!"
        return { right: "10px", top: "10px" }; // Adjust these values as needed
      // Add more cases for other steps if needed
      default:
        return { left: "10px", top: "10px" }; // Default position
    }
  };

  const handleSendInitialPrompt = async (msg = message) => {
    if (msg.trim() === "") {
      console.log("Message is empty, not sending");
      return;
    }

    console.log("Sending message:", msg);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5050/chat/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: msg,
          googleId: profile.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      console.log("Received response:", data);

      setChatHistory(data.messages);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setPromptLoading(false);
    }
  };

  const handleSendMessage = async (msg = message) => {
    if (msg.trim() === "") {
      console.log("Message is empty, not sending");
      return;
    }

    console.log("Sending message:", msg);

    setPendingMessage(msg);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5050/chat/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: msg,
          googleId: profile.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      console.log("Received response:", data);

      setChatHistory(data.messages);
      setMessage("");
    } catch (error) {
      console.error("Error:", error);
      // Handle error (e.g., display error message to user)
    } finally {
      setPendingMessage(null);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, pendingMessage]);

  const handleNext = () => {
    if (overlayStep < instructions.length - 1) {
      setOverlayStep(overlayStep + 1);
    } else {
      setOverlayStep(0);
      navigate("/relations");
    }
  };

  const handleSkip = () => {
    setOverlayStep(null);
  };

  const getOverlayClassName = (step) => {
    switch (step) {
      case 0:
        return "absolute top-1/3 left-1/2 transform -translate-x-1/4 -translate-y-3/4 flex justify-center";
      case 1:
        return "absolute top-1/3 left-1/2 mt-10 transform   -translate-x-1/4  -translate-y-3/4 flex justify-center";
      case 2:
        return "absolute top-1/3 left-1/2 transform  -translate-x-1/4  -translate-y-3/4 flex justify-center";
      case 3:
        return "absolute top-1/2 left-1/2 transform  -translate-x-1/4  -translate-y-1/4 flex justify-center ml-6";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pb-6 rounded-2xl bg-gradient-to-t from-indigo-200 from-10% via-blue-50 to-sky-50">
      {overlayStep !== null && (
        <Overlay
          step={overlayStep}
          onNext={handleNext}
          onSkip={handleSkip}
          instructions={instructions}
          // position={getOverlayPosition(overlayStep)} // Pass the position prop
          // className={
          //   overlayStep === 2
          //     ? "bg-sky-950 text-black flex items-center mt-20 ml-5"
          //     : ""
          // }
          className={getOverlayClassName(overlayStep)}
        />
      )}
      <div
        className="flex flex-row bg-sky-950 rounded-t-2xl text-white text-4xl pl-2 h-16 align-items "
        style={{ fontFamily: "Wildly Sans, sans-serif" }}
      >
        <svg
          width="60"
          height="64"
          fill="white"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          className="pt-1"
        >
          <circle cx="32" cy="28" r="21" />
          <defs>
            <clipPath id="circleView">
              <circle cx="32" cy="32" r="22" />
            </clipPath>
          </defs>
          <image
            href={AmikaFace}
            x="12"
            y="9"
            width="40"
            height="40"
            clipPath="url(#circleView)"
          />
        </svg>
        <h1 className="pt-2">Amika</h1>
      </div>
      <div className="flex-grow mb-4 p-4 overflow-y-scroll whitespace-normal ">
        {[...chatHistory].reverse().map((chat, index) => (
          <div key={index} className="mb-2 text-xs ">
            <div className="relative">
              <ReactMarkdown
                className={`whitespace-pre-wrap bg-white  rounded-lg px-3 py-2 w-1/2  mx-3 ${
                  chat.role === "user" ? "ml-auto" : "mr-auto"
                }`}
              >
                {chat.role === "user"
                  ? chat.content.startsWith(
                      "Pretend this is an email you sent to the user"
                    )
                    ? chat.content.split("Answer:").pop().trim()
                    : chat.content
                  : console.log(chat.content) ||
                    chat.content.replace(/^(NULL|UPDATE)\s*\n/, "")}
              </ReactMarkdown>
              <div className="text-sm font-semibold py-1">
                {chat.role === "user" ? (
                  <div className="text-right mr-5 flex flex-row justify-end ">
                    <p>You</p>
                  </div>
                ) : (
                  <div className="text-left ml-5 ">Amika</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {pendingMessage && (
          <>
            <div className="relative">
              <div className="whitespace-pre-wrap bg-white text-xs  rounded-lg px-3 py-2 w-1/2  mx-3  ml-auto">
                {pendingMessage}
              </div>

              <div className="text-sm font-semibold py-1">
                <div className="text-right mr-5 flex flex-row justify-end ">
                  <p>You</p>
                </div>

                <div className="text-left ml-5 ">
                  <div className="w-12 bg-white px-3 pb-1 rounded-full mb-1">
                    <TypingIndicator />
                  </div>
                  Amika
                </div>
              </div>
            </div>
          </>
        )}
        {promptLoading && (
          <>
            <div className="relative">
              <div className="text-sm font-semibold py-1">
                <div className="text-left ml-5 ">
                  <div className="w-12 bg-white px-3 pb-1 rounded-full mb-1">
                    <TypingIndicator />
                  </div>
                  Amika
                </div>
              </div>
            </div>
          </>
        )}

        <div ref={chatEndRef} />
      </div>
      <div className="relative block text-sm h-1/3 text-left align-top mx-6">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className=" text-left align-top p-2 w-full h-full flex-grow rounded-xl min-h-10"
          placeholder="Type Message..."
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className={`absolute right-1 bottom-1 lg:right-2  py-0.5 bg-sky-950 rounded-lg px-1 pl-2 bg-sky-950  z-10 ${
            isLoading
              ? "bg-opacity-30 text-slate-100"
              : "bg-opacity-100 text-white"
          }`}
          disabled={isLoading}
        >
          <span
            className="material-icons"
            style={{ transform: "rotate(320deg)" }}
          >
            send
          </span>
        </button>
      </div>
    </div>
  );
}
