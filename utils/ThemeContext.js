import React, { createContext, useReducer } from "react";

export const ThemeContext = createContext();

export const initialState = true
const themeReducer = (state, _) => !state

export function ThemeProvider(props) {
  const [state, dispatch] = useReducer(themeReducer, initialState);
  return <ThemeContext.Provider value={{ state, dispatch }}>{props.children}</ThemeContext.Provider>;
}