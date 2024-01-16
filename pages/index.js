import Home from "../components/Home";
import { useState } from "react";
import AppContext from "../helper/AppContext";

function App() {
  const [appContext, setAppContext] = useState({
    leagues: [],
    events: [],
    selectedEvents: [],
    order: {
      totalBet: 0,
      totalWin: 0,
    },
    showMobileOrder: false,
  });
  return (
    <AppContext.Provider
      value={{
        appContext,
        setAppContext,
      }}
    >
      <Home />
    </AppContext.Provider>
  );
}

export default App;
