import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppContext from "../../helper/AppContext";
import { getCookie } from "../../helper/cookieHelper";
import { getApiMessage, readJsonSafely } from "../../helper/apiResponse";
import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import Loader from "../Loader";
import SeoHead from "../SeoHead";
import styles from "./Notifications.module.css";

const formatNotificationTime = (value) => {
  if (!value) {
    return "Just now";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Just now";
  }

  return parsedDate.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function Notifications() {
  const {
    appContext,
    refreshNotificationState,
    markNotificationRead,
    markAllNotificationsRead,
  } = useContext(AppContext);
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const loadNotifications = async (nextFilter = filter) => {
    const accessToken = getCookie("access_token");
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setPageError("");

    try {
      const searchParams = new URLSearchParams({
        limit: "50",
      });
      if (nextFilter === "unread") {
        searchParams.set("status", "unread");
      }

      const response = await fetch(
        `https://service.yolofootball.com/api/notifications?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: accessToken,
          },
        }
      );
      const data = await readJsonSafely(response);
      if (!response.ok) {
        setPageError(getApiMessage(data, "Unable to load notifications right now."));
        return;
      }

      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
    } catch (error) {
      setPageError("Unable to load notifications right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!appContext.isAuthResolved) {
      return;
    }

    loadNotifications(filter);
  }, [appContext.isAuthResolved, filter]);

  const handleMarkRead = async (notificationId) => {
    const isMarked = await markNotificationRead(notificationId, {
      previewLimit: 5,
    });
    if (!isMarked) {
      return;
    }

    await loadNotifications(filter);
  };

  const handleMarkAllRead = async () => {
    const isMarked = await markAllNotificationsRead({
      previewLimit: 5,
    });
    if (!isMarked) {
      return;
    }

    await refreshNotificationState({ limit: 5 });
    await loadNotifications(filter);
  };

  return (
    <>
      <SeoHead
        title="Notifications"
        description="Review matchday alerts, prediction results, order settlement updates, and custom odds notifications."
        path="/notifications"
        noindex={true}
      />
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <HomeLogo />
          <HomeMenu />
        </nav>
      </div>
      <div className={styles.content}>
        <div className={styles.pageShell}>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>Notification Center</p>
            <h1>Stay on top of every matchday update</h1>
            <p className={styles.heroCopy}>
              Your inbox collects kickoff reminders for followed clubs, free prediction results,
              settled orders, and custom odds status changes.
            </p>
          </section>

          <section className={styles.inboxCard}>
            <div className={styles.toolbar}>
              <div className={styles.filterGroup}>
                <button
                  type="button"
                  className={`${styles.filterButton} ${
                    filter === "all" ? styles.filterButtonActive : ""
                  }`}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`${styles.filterButton} ${
                    filter === "unread" ? styles.filterButtonActive : ""
                  }`}
                  onClick={() => setFilter("unread")}
                >
                  Unread
                </button>
              </div>
              <button
                type="button"
                className={styles.markAllButton}
                onClick={handleMarkAllRead}
                disabled={isLoading || notifications.length === 0}
              >
                Mark all read
              </button>
            </div>

            {pageError && <p className={styles.error}>{pageError}</p>}
            {isLoading ? (
              <div className={styles.loaderWrap}>
                <Loader />
              </div>
            ) : notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <strong>No notifications to show right now.</strong>
                <p>
                  Once followed fixtures get close to kickoff or your activity settles, updates
                  will appear here.
                </p>
              </div>
            ) : (
              <div className={styles.notificationList}>
                {notifications.map((notification) => (
                  <article key={notification.id} className={styles.notificationItem}>
                    <div className={styles.notificationHeader}>
                      <div>
                        <h3>{notification.title}</h3>
                        <p className={styles.notificationMeta}>
                          {formatNotificationTime(notification.createdAt)} | {notification.type}
                        </p>
                      </div>
                      {notification.priority === "high" && (
                        <span className={styles.priorityBadge}>Priority</span>
                      )}
                    </div>
                    <p className={styles.notificationBody}>{notification.body}</p>
                    <div className={styles.notificationActions}>
                      <a href={notification.ctaPath || "/"} className={styles.primaryAction}>
                        Open
                      </a>
                      {notification.status === "unread" && (
                        <button
                          type="button"
                          className={styles.secondaryAction}
                          onClick={() => handleMarkRead(notification.id)}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <div className={styles.footer}>
        <h5>&reg;2023 Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default Notifications;
