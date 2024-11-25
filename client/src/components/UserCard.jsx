// export default RelationRow;
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { RRule } from "rrule";

// To display each relation row in the table
const UserCard = (props) => {
  const { profile } = useContext(AuthContext); // get user profile
  // Debugging: Log the profile object
  console.log("UserCard profile:", props.userInfo);

  const getGoogleDriveImageUrl = (url) => {
    const match = url.match(/\/d\/(.*?)\//);
    if (match) {
      const imageUrl = `https://drive.google.com/thumbnail?id=${match[1]}`;
      console.log("Constructed Google Drive Image URL:", imageUrl);
      return imageUrl;
    }
    return url;
  };

  return (
    <div className="m-1 p-0">
      <div className="flex flex-row justify-start h-24">
        <div className="flex bg-white w-1/4 rounded-2xl ml-2 mt-2 justify-center overflow-hidden">
          {props.userInfo.picture ? (
            <img
              // src="https://drive.google.com/thumbnail?id=13m-LgN_qlUIi1JHTNPjcgw0rDXjqEKQ1"
              src={getGoogleDriveImageUrl(props.userInfo.picture)}
              className=" w-full h-full object-cover"
              alt="Relation"
              onError={(e) => console.error("Image failed to load:", e)}
            />
          ) : (
            <svg
              className="w-full"
              viewBox="0 0 24 32"
              fill="lightgray"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="5" />
              <rect x="5" y="20" width="14" height="18" />
            </svg>
          )}
        </div>
        <div className=" w-3/4 pl-4 pt-2 overflow-y-scroll">
          <p className="font-bold text-md">
            {props.userInfo.first_name} {props.userInfo.last_name}{" "}
            {props.userInfo.pronouns &&
              props.userInfo.pronouns !== "<they/them>" && (
                <span className="font-normal text-sm">
                  ({props.userInfo.pronouns})
                </span>
              )}
          </p>
        </div>
      </div>

      <div className="mt-5 bg-white rounded-xl h-52 overflow-y-scroll">
        <div className="p-4 ">
          <h2 className="font-bold">Info</h2>
          <ul className="list-disc ml-4 text-xs">
            <li>
              {" "}
              {props.userInfo.interests && (
                <p> Interests: {props.userInfo.interests}</p>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-end text-sm py-2 font-bold px-2">
        <span className="text-blue-500 hover:text-cyan-300 ">
          <Link to="/profile/edit">Edit</Link>
        </span>
      </div>
    </div>
  );
};

export default UserCard;
