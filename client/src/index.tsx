import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { SnackbarProvider } from "notistack";
import theme from "./overrieds/MuiTheme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthContextProvider } from "./hooks/authController/AuthContext";
import GraphqlClientProvider from "./hooks/GraphqlClientProvider/GraphqlClientProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import EventProvider from "./hooks/context/EventContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
)

root.render(
  <React.StrictMode>
    <GraphqlClientProvider>
      <AuthContextProvider>
        <GoogleOAuthProvider clientId="609625376917-10s753e3lkot1414g4kolcphcihjtb0k.apps.googleusercontent.com">
          <EventProvider>
            {/* <UserProvider> */}
            <SnackbarProvider maxSnack={3}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
              </ThemeProvider>
            </SnackbarProvider>
            {/* </UserProvider> */}
          </EventProvider>
        </GoogleOAuthProvider>
      </AuthContextProvider>
    </GraphqlClientProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
