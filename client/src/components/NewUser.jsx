import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { OverlayContext } from "../OverlayProvider"; // Import OverlayContext

export default function NewUser() {
  const { profile } = useContext(AuthContext); // get user profile
  const { startOverlaySequence } = useContext(OverlayContext); // Use OverlayContext
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => {
    const [first_name, ...last_name] = profile.name.split(" ");
    return {
      first_name: first_name || "",
      last_name: last_name.join(" ") || "",
      pronouns: "<they/them>",
      picture: profile.picture || "",
      interests: "",
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("profile email: ", profile.email);
      const response = await fetch("http://localhost:5050/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          googleId: profile.id,
          email: profile.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          pronouns: formData.pronouns,
          picture: formData.picture,
          interests: formData.interests,
        }),
      });

      if (response.ok) {
        await fetch(`http://localhost:5050/users/${profile.id}/thread_ids`, {
          method: "POST",
        });
        console.log("User and thread IDs created successfully");
        startOverlaySequence(); // Start overlay sequence using context
        navigate("/chat");
      } else {
        console.error("Error creating user");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const isFormValid = () => {
    return formData.first_name.trim() !== "";
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen items-center">
      <form
        onSubmit={onSubmit}
        className="flex flex-col text-left justify-center w-3/4 min-w-64 h-5/8 min-h-64 pt-10 bg-gradient-to-t from-indigo-100 from-10% via-blue-50 to-sky-50 p-5 rounded-3xl"
      >
        <h1 className="font-bold text-2xl">Your Information</h1>
        <div className="p-2 ">
          First Name:{" "}
          <input
            type="text"
            name="first_name"
            className=" placeholder:text-slate-400 focus:ring-0 rounded-lg px-3 py-1 w-full "
            placeholder="Enter your first name"
            value={formData.first_name}
            onChange={handleChange}
            autocomplete="off"
          />
          {!isFormValid() && (
            <span style={{ color: "red" }}>First name cannot be empty</span>
          )}
        </div>
        <div className="p-2">
          Last Name:{" "}
          <input
            type="text"
            name="last_name"
            className=" placeholder:text-slate-400 focus:ring-0 rounded-lg px-3 py-1 w-full"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChange={handleChange}
            autocomplete="off"
          />
        </div>
        <div className="p-2">
          Pronouns:{" "}
          <input
            type="text"
            name="pronouns"
            className=" placeholder:text-slate-400 focus:ring-0 rounded-lg px-3 py-1 w-full"
            placeholder="Enter your preferred pronouns (she/her, he/him, they/them, etc.)"
            value={formData.pronouns !== "<they/them>" ? formData.pronouns : ""}
            onChange={handleChange}
            autocomplete="off"
          />
        </div>
        <div className="p-2">
          Interests:{" "}
          <input
            type="text"
            name="interests"
            className=" placeholder:text-slate-400 focus:ring-0 rounded-lg px-3 py-1 w-full"
            placeholder="Enter your interests, hobbies, etc."
            value={formData.interests}
            onChange={handleChange}
            autocomplete="off"
          />
        </div>
        <div className="p-2">
          Profile Picture:
          <div className="flex flex-row">
            <img
              // src="https://drive.google.com/thumbnail?id=13m-LgN_qlUIi1JHTNPjcgw0rDXjqEKQ1"
              src={getGoogleDriveImageUrl(formData.picture)}
              className=" w-full h-full object-cover rounded-full mr-4 max-w-24 w-1/5"
              alt="Profile Picture"
              onError={(e) => console.error("Image failed to load:", e)}
            />
            {/* <img
              src={formData.picture}
              alt="Profile"
              className="w-20 rounded-full mr-4"
            /> */}
            <input
              type="text"
              name="picture"
              className=" placeholder:text-slate-400 focus:ring-0 rounded-lg px-3 py-1 w-full"
              placeholder="Enter a link to your picture"
              value={formData.picture}
              onChange={handleChange}
              autocomplete="off"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!isFormValid()}
            className=" my-1 font-semibold py-1.5 p-2 bg-sky-950 text-center text-white rounded-md w-1/3 min-w-56 text-sm md:text-lg hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
