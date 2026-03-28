import { useEffect, useState } from "react";
import AppContext from "./AppContext";
import { getCookie } from "./cookieHelper";
import normalizeUserProfile from "./normalizeUserProfile";

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
  isAuthResolved: false,
};

export default function AppContextProvider({ children }) {
  const [appContext, setAppContext] = useState(initialAppContext);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const accessToken = getCookie("access_token");

      if (!accessToken) {
        if (isMounted) {
          setAppContext((currentContext) => ({
            ...currentContext,
            isAuthResolved: true,
          }));
        }
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

        if (!isMounted) {
          return;
        }

        if (data && data.message === "succeed") {
          setAppContext((currentContext) => ({
            ...currentContext,
            userProfile: normalizeUserProfile(data.userProfile),
            isAuthResolved: true,
          }));
        } else if (data && data.message === "unauth") {
          setAppContext((currentContext) => ({
            ...currentContext,
            userProfile: undefined,
            isAuthResolved: true,
          }));
        } else if (isMounted) {
          setAppContext((currentContext) => ({
            ...currentContext,
            userProfile: undefined,
            isAuthResolved: true,
          }));
        }
      } catch (error) {
        console.error("Failed to load user profile", error);
        if (isMounted) {
          setAppContext((currentContext) => ({
            ...currentContext,
            userProfile: undefined,
            isAuthResolved: true,
          }));
        }
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
