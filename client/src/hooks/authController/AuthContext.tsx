/* eslint-disable no-debugger */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-empty-function */

import backendAPI from "../../api";
import { useState, useContext, createContext, useEffect } from "react";
import { googleLogout } from "@react-oauth/google";

const AuthContext = createContext({
  currentUser: null,
  signUp: async (
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string
  ) => { },
  resetPasswordSendMail: async (usernameOrMail: string) => { },
  resetPassword: async (newPassword: string, token: string) => { },
  signIn: async (email: string, password: string) => { },
  signOut: async () => { },
  isUserSignedIn: () => { },
  getUser: () => { },
  getUserProfilePicture: () => { },
  logWithGoogle: async (accessToken: string) => { },
  checkIfSessionValid: async () => {},
  setCredit: (newCredit: number) => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [isFromGoogle, setIsFromGoogle] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfilePicture, setUserProfilePicture] = useState(
    "https://source.unsplash.com/xpTsS9PJMXQ"
  );

  async function logWithGoogle(accessToken: string) {
    try {
      setIsFromGoogle(true);
      await backendAPI.auth.loginAuthWithGoogle(accessToken);
      await checkIfSessionValid();
    } catch (error) {
      throw error;
    }
  }

  async function signUp(
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string
  ) {
    // eslint-disable-next-line no-useless-catch
    try {
      await backendAPI.auth.signUpWithEmailAndPassword(
        email,
        username,
        firstName,
        lastName,
        password
      );
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await backendAPI.auth.signInWithEmailAndPassword(
        email,
        password
      );
      checkIfSessionValid();
    } catch (error: any) {
      console.log("in error from user context signIn");
      throw new Error(error?.response?.data?.functionalityError?.message);
    }
  }

  async function resetPasswordSendMail(usernameOrMail: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      await backendAPI.auth.resetPasswordSendMail(usernameOrMail);
    } catch (error: any) {
      console.log("in error from user context resetPasswordSendMail");
      throw new Error(error?.response?.data?.functionalityError?.message);
    }
  }

  async function resetPassword(newPassword: string, token: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      await backendAPI.auth.resetPassword(newPassword, token);
    } catch (error: any) {
      console.log("in error from user context resetPassword");
      throw new Error(error?.response?.data?.functionalityError?.message);
    }
  }

  async function checkIfSessionValid() {
    // eslint-disable-next-line no-useless-catch
    try {
      const user = await backendAPI.auth.getCurrentSession();
      console.log(user);
      setCurrentUser(user.data);
    } catch (error: any) {
      console.log("in error from user context checkIfSessionValid");
    }
  }

  async function signOut() {
    setCurrentUser(null);
    if (isFromGoogle) googleLogout();
    backendAPI.auth.logOut();
  }

  function isUserSignedIn() {
    return currentUser != null;
  }

  function getUser() {
    return currentUser;
  }

  function getUserProfilePicture() {
    return userProfilePicture;
  }

  function setCredit(newCredit: number) {
    currentUser.credit = newCredit
    setCurrentUser(currentUser)
  }

  const value = {
    currentUser,
    isUserSignedIn,
    signUp,
    signIn,
    signOut,
    getUser,
    getUserProfilePicture,
    logWithGoogle,
    checkIfSessionValid,
    resetPasswordSendMail,
    resetPassword,
    setCredit
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
