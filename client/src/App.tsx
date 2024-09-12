import { Container } from "@mui/material";
import Login from "./components/Login";
import UserConfirmation from "./components/UserConfirmation";
import Signup from "./components/Signup";
import Navbar from "./components/AppBar/AppBar";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import { CreateEvent } from "./components/CreateEvent";
import { Event } from "./components/Event/Event";
import { ImportTicket } from "./components/ImportTicket";
import CaptainEvents from "./components/CapatinEvents";
import ScanEvent from "./components/ScanEvent";
import MyTickets from "./components/profile/MyTickets";
import { Profile } from "./components/profile/Profile";
import { MyEvents } from "./components/profile/MyEvents";
import SideChatbot from "./components/SideChatbot";
import { EventsPage } from "./components/EventsPage/EventsPage";
import { useAuth } from "./hooks/authController/AuthContext";
import { useEffect } from "react";
import { MyDetails } from "./components/profile/MyDetails";
import ForgotPassword from "./components/ForgotPassword";

// use this enum to make links to pages
export enum RoutePaths {
  LOGIN = "/login",
  FORGOT_PASSWORD = "/forgotpassword",
  SIGNUP = "/signup",
  EVENTS = "/",
  CAPTAIN_EVENTS = "/captain/events",
  CAPTAIN = "/captain",
  CREATE_EVENT = "/create-event",
  IMPORT_TICKET = "/import-ticket",
  PROFILE = "/profile",
  MY_EVENTS = "/profile/events",
  MY_TICKETS = "/profile/tickets",
  MY_DETAILS = "/profile/details",
  EVENT = "/event",
  SCAN_EVENT = "/event/scan",
  USER_CONFIRMATION = "/user-confirmation",
}

const router = createBrowserRouter([
  {
    element: (
      <>
        <Navbar />
        <Container sx={{ height: "90%" }} maxWidth={"xl"}>
          <Outlet />
        </Container>
        <SideChatbot />
      </>
    ),
    children: [
      {
        path: RoutePaths.LOGIN,
        element: <Login />,
      },
      {
        path: RoutePaths.SIGNUP,
        element: <Signup />,
      },
      {
        path: RoutePaths.FORGOT_PASSWORD,
        element: <ForgotPassword />,
      },
      {
        path: RoutePaths.EVENTS,
        element: (
          <PrivateRoute>
            <EventsPage />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePaths.CAPTAIN_EVENTS,
        element: (
          <PrivateRoute>
            <CaptainEvents />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePaths.CREATE_EVENT,
        element: (
          <PrivateRoute>
            <CreateEvent />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePaths.USER_CONFIRMATION,
        element: <UserConfirmation />,
      },
      {
        path: RoutePaths.IMPORT_TICKET,
        element: (
          <PrivateRoute>
            <ImportTicket />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePaths.PROFILE,
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
        children: [
          {
            path: RoutePaths.MY_EVENTS,
            element: (
              <PrivateRoute>
                <MyEvents />
              </PrivateRoute>
            ),
          },
          {
            path: RoutePaths.MY_TICKETS,
            element: (
              <PrivateRoute>
                <MyTickets />
              </PrivateRoute>
            ),
          },
          {
            path: RoutePaths.MY_DETAILS,
            element: (
              <PrivateRoute>
                <MyDetails />
              </PrivateRoute>
            ),
          },
        ],
      },
      {
        path: RoutePaths.MY_EVENTS,
        element: (
          <PrivateRoute>
            <MyEvents />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePaths.MY_TICKETS,
        element: (
          <PrivateRoute>
            <MyTickets />
          </PrivateRoute>
        ),
      },
      {
        path: `${RoutePaths.SCAN_EVENT}/:id`,
        element: (
          <PrivateRoute>
            <ScanEvent />
          </PrivateRoute>
        ),
      },
      {
        path: `${RoutePaths.EVENT}/:id`,
        element: (
          <PrivateRoute>
            <Event />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

const App = () => {
  const { checkIfSessionValid } = useAuth();
  useEffect(() => {
    checkIfSessionValid();
  }, []);
  return <RouterProvider router={router} />;
};

export default App;
