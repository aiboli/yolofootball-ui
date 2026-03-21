import { useEffect, useState } from "react";
import AppContext from "./AppContext";
import { getCookie } from "./cookieHelper";

const initialAppContext = {
  leagues: [],
  events: [],
  selectedEvents: [],
  order: {
    totalBet: 0,
    combinedOdd: 0,
    totalWin: 0,
  },
  showMobileOrder: false,
  userProfile: undefined,
  userActiveOrder: {
    orders: [],
  },
  isBusy: false,
};

export default function AppContextProvider({ children }) {
  const [appContext, setAppContext] = useState(initialAppContext);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const accessToken = getCookie("access_token");

      if (!accessToken) {
        return;
      }

      try {
        const res = await fetch(
          "https://service.yolofootball.com/api/users/profile",
          {
            method: "GET",
            headers: {
              Authorization: accessToken,
            },
          }
        );
        const data = await res.json();

        if (!isMounted || (data && data.message === "unauth")) {
          return;
        }

        if (data && data.message === "succeed") {
          setAppContext((currentContext) => ({
            ...currentContext,
            userProfile: {
              userName: data.userProfile.userName,
              userEmail: data.userProfile.userEmail,
              userId: data.userProfile.userId,
              userOrderIds: data.userProfile.userOrderIds,
              userCreatedBidIds: data.userProfile.userCreatedBidIds,
              userBalance: data.userProfile.userBalance,
            },
          }));
        }
      } catch (error) {
        console.error("Failed to load user profile", error);
      }
    }
    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppContext.Provider value={{ appContext, setAppContext }}>
      {children}
    </AppContext.Provider>
  );
}
