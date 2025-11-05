import React, { createContext, useContext } from "react";

const ResponsiveContext = createContext({
  isMobile: false,
});

export function ResponsiveProvider({ isMobile, children }) {
  return (
    <ResponsiveContext.Provider value={{ isMobile }}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsive() {
  return useContext(ResponsiveContext);
}

