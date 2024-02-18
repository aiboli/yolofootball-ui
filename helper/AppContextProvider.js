import { useState } from "react";
import AppContext from "./AppContext";
export default function AppContextProvider({ children }) {
  const [appContext, setAppContext] = useState({
    leagues: [],
    events: [],
    selectedEvents: [],
    order: {
      totalBet: 0,
      totalWin: 0,
    },
    showMobileOrder: false,
    userProfile: undefined,
  });

  return (
    <AppContext.Provider value={{ appContext, setAppContext }}>
      {children}
    </AppContext.Provider>
  );
}
