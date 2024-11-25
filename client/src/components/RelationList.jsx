import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import RelationCard from "./RelationCard";
import { AuthContext } from "../AuthContext";
import Overlay from "./Overlay"; // Import the Overlay component
import { OverlayContext } from "../OverlayProvider";
import UserCard from "./UserCard";

export default function RelationsList() {
  const [relations, setRelations] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const { profile } = useContext(AuthContext); // get user profile
  const { overlayStep, setOverlayStep } = useContext(OverlayContext); // Use OverlayContext
  const instructions = [
    "This is your relations list. You can view and manage your relations here.",
    "There aren't any relation right now because you haven't added any yet.",
    "Click the '+' button in the bottom right corner to add a new relation manually. Alternatively, I am able to update information about these relations based on our conversations in the chat! ",
  ];
  const navigate = useNavigate();

  // Method to fetch all relations from the database.
  useEffect(() => {
    async function getRelations() {
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations`
      );
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const relationsResponse = await response.json();
      setRelations(relationsResponse);
      // console.log("RELATIONS: ", relations);
    }

    async function getUserInfo() {
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/info`
      );
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const userInfoResponse = await response.json();
      console.log("*****RESPONSE: ", userInfoResponse);
      setUserInfo(userInfoResponse);
      // console.log("RELATIONS: ", relations);
    }
    getRelations();
    getUserInfo();
  }, [profile]);

  // Method to delete a relation
  async function deleteRelation(relationId) {
    try {
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations/${relationId}`,
        {
          method: "DELETE",
        }
      );

      const newRelations = relations.filter((el) => el._id !== relationId);
      setRelations(newRelations);
    } catch (error) {
      console.error("Error deleting relation:", error);
    }
  }

  // This method will map out the relations cards on the table
  function relationList() {
    return [
      <div
        key="user-card"
        className="bg-white bg-gradient-to-t from-violet-200 from-10% to-indigo-100 rounded-3xl p-4 max-w-80 min-w-64 h-96"
      >
        <UserCard userInfo={userInfo} />
      </div>,
      ...relations.map((relation) => {
        return (
          <div
            key={relation._id}
            className="bg-white bg-gradient-to-t from-indigo-100 to-sky-50 rounded-3xl p-4 max-w-80 min-w-64 h-96"
          >
            <RelationCard relation={relation} deleteRelation={deleteRelation} />
          </div>
        );
      }),
    ];
  }

  const handleNext = () => {
    if (overlayStep < instructions.length - 1) {
      setOverlayStep(overlayStep + 1);
    } else {
      setOverlayStep(0);
      navigate("/users/relations");
    }
  };

  const handleSkip = () => {
    setOverlayStep(null);
  };

  const getOverlayClassName = (step) => {
    switch (step) {
      case 0:
        return "absolute top-1/4 left-1/2 transform -translate-x-1/4 -translate-y-3/4 flex justify-center";
      case 1:
        return "absolute top-1/4 left-1/2 transform -translate-x-1/4 -translate-y-3/4 flex justify-center";
      case 2:
        return "absolute bottom-0 right-0 transform -translate-x-1/4 mb-4 flex justify-center";
      
    }
  };

  return (
    <div className="pt-8 pb-12 px-4 h-screen">
      {overlayStep !== null && (
        <Overlay
          step={overlayStep}
          onNext={handleNext}
          onSkip={handleSkip}
          instructions={instructions}
          className={getOverlayClassName(overlayStep)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-6 gap-x-2 sm:gap-x-[10px] pb-12">
        {relationList()}
      </div>

      {relations.length === 0 && (
        <div className="flex justify-center items-center text-center h-1/3">
          <div className="text-slate-300 ">
            <p>No Information on your Relations.</p>
            <p>Add relations using the "+"!</p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={() => navigate("/users/relations")}
          className="bg-indigo-300 hover:bg-sky-100 hover:border hover:border-slate-900 fixed bottom-4 right-4 flex items-center justify-center rounded-full h-12 w-12"
        >
          <svg
            className="w-6 h-6 text-bold text-2xl"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
