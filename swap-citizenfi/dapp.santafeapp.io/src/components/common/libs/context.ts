import { useContext, createContext } from "react";

export const AppContext = createContext<any>({});

export function useAppContext() {
  return useContext(AppContext);
}
