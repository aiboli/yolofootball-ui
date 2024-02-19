import { useState, useLayoutEffect } from "react";
import AppContext from "./AppContext";
import { getCookie } from "./cookieHelper";
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

  useLayoutEffect(() => {
    async function checkAuth() {
      if (getCookie("access_token")) {
        const res = await fetch(
          "https://service.yolofootball.com/api/users/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "same-origin",
            mode: "no-cors",
          }
        );
        const data = await res.json();
        if (data && data.message === "unauth") {
          return;
        } else if (data && data.message === "succeed") {
          setAppContext({
            ...appContext,
            userProfile: {
              userName: data.userProfile.userName,
              userEmail: data.userProfile.userEmail,
              userId: data.userProfile.userId,
            },
          });
          return;
        } else {
          return;
        }
      }
    }
    checkAuth();
    //check local token or something
  }, []);

  return (
    <AppContext.Provider value={{ appContext, setAppContext }}>
      {children}
    </AppContext.Provider>
  );
}
