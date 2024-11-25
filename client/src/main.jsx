import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // react router updates only the portion of the website that is changed instead of the entire website; essential for responsiveness
import App from "./App";
import RelationForm from "./components/RelationForm";
import RelationList from "./components/RelationList";
import Login from "./components/Login";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./AuthContext";
import Settings from "./components/Settings";
import Chat from "./components/Chat";
import NewUser from "./components/NewUser";
import { OverlayProvider } from "./OverlayProvider";
import UserInfoForm from "./components/UserInfoForm"; 

const clientId =
  "182357756258-759f39bnehg84lammns3g3rcvnqjte2u.apps.googleusercontent.com";

// App is displayed on every load, outlet in App.jsx changes out what is loaded below as a child depending on the path
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/new-user",
    element: <NewUser />,
  },

  {
    path: "/relations",
    element: <App />,
    children: [
      {
        path: "/relations",
        element: <RelationList />,
      },
    ],
  },
  {
    path: "/users/relations",
    element: <App />,
    children: [
      {
        path: "/users/relations",
        element: <RelationForm />,
      },
    ],
  },
  {
    path: "/users/:googleId/relations/edit/:id",
    element: <App />,
    children: [
      {
        path: "/users/:googleId/relations/edit/:id",
        element: <RelationForm />,
      },
    ],
  },
  {
    path: "/profile/edit",
    element: <App />,
    children: [
      {
        path: "/profile/edit",
        element: <UserInfoForm />,
      },
    ],
  },

  {
    path: "/settings",
    element: <App />,
    children: [
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/chat",
    element: <App />,
    children: [
      {
        path: "/chat",
        element: <Chat />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <OverlayProvider>
        <React.StrictMode>
          <RouterProvider router={router} />
        </React.StrictMode>
      </OverlayProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);
