import { useEffect, useState } from "react";
import AppContext from "./AppContext";
import { getCookie } from "./cookieHelper";
import normalizeUserProfile from "./normalizeUserProfile";
import { readJsonSafely } from "./apiResponse";

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
  notifications: [],
  unreadNotificationCount: 0,
  isNotificationsBusy: false,
  userActiveOrder: {
    orders: [],
  },
  isBusy: false,
  isAuthResolved: false,
};

export default function AppContextProvider({ children }) {
  const [appContext, setAppContext] = useState(initialAppContext);

  const clearNotificationState = () => {
    setAppContext((currentContext) => ({
      ...currentContext,
      notifications: [],
      unreadNotificationCount: 0,
      isNotificationsBusy: false,
    }));
  };

  const refreshUnreadNotificationCount = async ({ accessToken } = {}) => {
    const nextAccessToken = accessToken || getCookie("access_token");
    if (!nextAccessToken) {
      clearNotificationState();
      return 0;
    }

    try {
      const response = await fetch(
        "https://service.yolofootball.com/api/notifications/unread-count",
        {
          method: "GET",
          headers: {
            Authorization: nextAccessToken,
          },
        }
      );
      const data = await readJsonSafely(response);
      if (!response.ok) {
        return 0;
      }

      const unreadCount = Number(data?.unreadCount || 0);
      setAppContext((currentContext) => ({
        ...currentContext,
        unreadNotificationCount: unreadCount,
      }));
      return unreadCount;
    } catch (error) {
      console.error("Failed to load unread notification count", error);
      return 0;
    }
  };

  const refreshNotifications = async ({
    accessToken,
    status = "unread",
    limit = 5,
  } = {}) => {
    const nextAccessToken = accessToken || getCookie("access_token");
    if (!nextAccessToken) {
      clearNotificationState();
      return [];
    }

    setAppContext((currentContext) => ({
      ...currentContext,
      isNotificationsBusy: true,
    }));

    try {
      const response = await fetch(
        `https://service.yolofootball.com/api/notifications?status=${encodeURIComponent(
          status
        )}&limit=${encodeURIComponent(limit)}`,
        {
          method: "GET",
          headers: {
            Authorization: nextAccessToken,
          },
        }
      );
      const data = await readJsonSafely(response);
      const notifications = response.ok && Array.isArray(data?.notifications)
        ? data.notifications
        : [];

      setAppContext((currentContext) => ({
        ...currentContext,
        notifications,
        isNotificationsBusy: false,
      }));
      return notifications;
    } catch (error) {
      console.error("Failed to load notifications", error);
      setAppContext((currentContext) => ({
        ...currentContext,
        notifications: [],
        isNotificationsBusy: false,
      }));
      return [];
    }
  };

  const refreshNotificationState = async ({ accessToken, limit = 5 } = {}) => {
    const nextAccessToken = accessToken || getCookie("access_token");
    if (!nextAccessToken) {
      clearNotificationState();
      return;
    }

    await Promise.all([
      refreshUnreadNotificationCount({ accessToken: nextAccessToken }),
      refreshNotifications({ accessToken: nextAccessToken, status: "unread", limit }),
    ]);
  };

  const markNotificationRead = async (notificationId, { previewLimit = 5 } = {}) => {
    const accessToken = getCookie("access_token");
    if (!accessToken || !notificationId) {
      return false;
    }

    try {
      const response = await fetch(
        `https://service.yolofootball.com/api/notifications/${encodeURIComponent(
          notificationId
        )}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: accessToken,
          },
        }
      );
      if (!response.ok) {
        return false;
      }

      await refreshNotificationState({
        accessToken,
        limit: previewLimit,
      });
      return true;
    } catch (error) {
      console.error("Failed to mark notification read", error);
      return false;
    }
  };

  const markAllNotificationsRead = async ({ previewLimit = 5 } = {}) => {
    const accessToken = getCookie("access_token");
    if (!accessToken) {
      return false;
    }

    try {
      const response = await fetch(
        "https://service.yolofootball.com/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization: accessToken,
          },
        }
      );
      if (!response.ok) {
        return false;
      }

      await refreshNotificationState({
        accessToken,
        limit: previewLimit,
      });
      return true;
    } catch (error) {
      console.error("Failed to mark all notifications read", error);
      return false;
    }
  };

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
          clearNotificationState();
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
          await refreshNotificationState({ accessToken });
          setAppContext((currentContext) => ({
            ...currentContext,
            userProfile: normalizeUserProfile(data.userProfile),
            isAuthResolved: true,
          }));
        } else if (data && data.message === "unauth") {
          clearNotificationState();
          setAppContext((currentContext) => ({
            ...currentContext,
            userProfile: undefined,
            isAuthResolved: true,
          }));
        } else if (isMounted) {
          clearNotificationState();
          setAppContext((currentContext) => ({
            ...currentContext,
            userProfile: undefined,
            isAuthResolved: true,
          }));
        }
      } catch (error) {
        console.error("Failed to load user profile", error);
        if (isMounted) {
          clearNotificationState();
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

  useEffect(() => {
    if (!appContext.isAuthResolved || !appContext.userProfile?.userName) {
      return undefined;
    }

    let isDisposed = false;

    const refreshIfVisible = async () => {
      if (isDisposed || typeof document === "undefined" || document.hidden) {
        return;
      }

      await refreshNotificationState();
    };

    const intervalId = window.setInterval(refreshIfVisible, 60000);
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [appContext.isAuthResolved, appContext.userProfile?.userName]);

  return (
    <AppContext.Provider
      value={{
        appContext,
        setAppContext,
        refreshNotificationState,
        refreshNotifications,
        refreshUnreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
