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
    isBusy: false,
  });

  useLayoutEffect(() => {
    async function checkAuth() {
      if (getCookie("access_token")) {
        const res = await fetch(
          "https://service.yolofootball.com/api/users/profile",
          {
            method: "GET",
            headers: {
              Authorization: `${getCookie("access_token")}`,
            },
          }
        );
        const data = await res.json();
        if (data && data.message === "unauth") {
          return;
        } else if (data && data.message === "succeed") {
          console.log(data);
          setAppContext({
            ...appContext,
            userProfile: {
              userName: data.userProfile.userName,
              userEmail: data.userProfile.userEmail,
              userId: data.userProfile.userId,
              userOrderIds: data.userProfile.order_ids,
              userCreatedBidIds: data.userProfile.created_bid_ids,
              userBalance: data.userProfile.account_balance,
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
