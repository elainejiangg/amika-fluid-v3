/**
 * App.jsx
 *
 * This component serves as the main entry point for the application. It sets up the
 * routing for the application, manages the visibility of the navigation bar, and
 * handles the overall layout of the application.
 *
 * Key functionalities include:
 * - Managing the visibility of the Navbar component based on user interactions.
 * - Rendering child components using React Router's Outlet for nested routing.
 * - Providing a toggle function to show or hide the Navbar.
 *
 * The component utilizes React hooks for state management and side effects.
 */

import { useState } from "react"; // Import useState hook for managing state
import { Outlet } from "react-router-dom"; // Import Outlet for rendering child routes
import Navbar from "./components/Navbar"; // Import Navbar component

const App = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(false); // State to manage Navbar visibility

  // Function to toggle the visibility of the Navbar
  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible); // Toggle the state
  };

  return (
    <div className="flex w-screen h-screen justify-start">
      {isNavbarVisible && (
        <div className="fixed top-0 left-0 w-2/5 z-50 block lg:hidden">
          <Navbar toggleNavbar={toggleNavbar} xVisible={true} />{" "}
          {/* Render Navbar for mobile view */}
        </div>
      )}
      <div className="sm:w-1/5 w-0 hidden h-screen lg:block">
        <Navbar toggleNavbar={toggleNavbar} xVisible={false} />{" "}
        {/* Render Navbar for desktop view */}
      </div>

      <div className="flex lg:hidden mt-2 ml-2">
        <div
          className="flex mt-1 ml-0 h-12 w-12 justify-center items-center rounded-full bg-indigo-200 hover:bg-sky-100 hover:border hover:border-slate-900"
          // className="flex mt-1 ml-0 h-12 w-12 justify-center items-center rounded-full bg-gradient-to-tl hover:from-indigo-300 hover:via-indigo-300  hover:to-indigo-300  from-indigo-200 from-10% via-indigo-50 via-30% to-violet-200 group hover:bg-indigo-300 cursor-pointer"
          onClick={toggleNavbar} // Toggle Navbar on click
        >
          <svg
            className="w-8 h-8 text-black group-hover:text-white "
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </div>
      </div>
      <div
        className={`w-full lg:w-4/5 pl-2 pr-4 lg:px-6 py-4 overflow-y-auto  ${
          isNavbarVisible ? "ml-1/5" : ""
        }`}
      >
        <Outlet /> {/* Render child components based on the current route */}
      </div>
    </div>
  );
};

export default App; // Export the App component
