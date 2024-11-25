import { useState } from "react";
import { Outlet } from "react-router-dom"; // displays child components defined in routes in main.jsx
import Navbar from "./components/Navbar";

const App = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);

  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible);
  };

  return (
    <div className="flex w-screen h-screen justify-start ">
      {isNavbarVisible && (
        <div className="fixed top-0 left-0 w-2/5 z-50 block lg:hidden">
          <Navbar toggleNavbar={toggleNavbar} xVisible={true} />
        </div>
      )}
      <div className="sm:w-1/5 w-0 hidden h-screen lg:block ">
        <Navbar toggleNavbar={toggleNavbar} xVisible={false} />
      </div>

      <div className="flex lg:hidden mt-2 ml-2">
        <div
          className="flex mt-1 ml-0 h-12 w-12 justify-center items-center rounded-full bg-indigo-200 hover:bg-sky-100 hover:border hover:border-slate-900"
          // className="flex mt-1 ml-0 h-12 w-12 justify-center items-center rounded-full bg-gradient-to-tl hover:from-indigo-300 hover:via-indigo-300  hover:to-indigo-300  from-indigo-200 from-10% via-indigo-50 via-30% to-violet-200 group hover:bg-indigo-300 cursor-pointer"
          onClick={toggleNavbar}
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
        <Outlet />
      </div>
    </div>
  );
};

export default App;
