import { createContext, useContext } from "react";
export interface IUserContext {
  user: any | undefined;
  // user: User | undefined;
  setUser: (user: any | undefined) => void;
  // setUser: (user: User | undefined) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}
const defaultValue: IUserContext = {
  user: undefined,
  setUser: () => {},
  isLoading: true,
  setIsLoading: () => {},
};

export const UserContext = createContext(defaultValue);
export const useUserContext = (): IUserContext => useContext(UserContext);
