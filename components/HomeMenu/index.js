import styles from "./HomeMenu.module.css";
import AppContext from "../../helper/AppContext";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { eraseCookie } from "../../helper/cookieHelper";

function HomeMenu() {
  const { appContext, setAppContext } = useContext(AppContext);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const unreadNotificationCount = Number(appContext.unreadNotificationCount || 0);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    closeMenu();
  }, [router.asPath]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const signOut = (event) => {
    event.preventDefault();
    closeMenu();
    eraseCookie("access_token");
    setAppContext((currentContext) => ({
      ...currentContext,
      userProfile: undefined,
      isAuthResolved: true,
      userActiveOrder: {
        orders: [],
      },
      selectedEvents: [],
      notifications: [],
      unreadNotificationCount: 0,
      isNotificationsBusy: false,
      order: {
        totalBet: 0,
        combinedOdd: 0,
        totalWin: 0,
      },
    }));
    router.push("/");
  };

  return (
    <div className={styles.homemenu} ref={menuRef}>
      {appContext.userProfile?.userName && (
        <a
          href="/notifications"
          className={styles.notificationButton}
          onClick={(event) => {
            event.preventDefault();
            closeMenu();
            router.push("/notifications");
          }}
          aria-label={
            unreadNotificationCount > 0
              ? `${unreadNotificationCount} unread notifications`
              : "Open notifications"
          }
        >
          <svg
            className={styles.notificationIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"></path>
            <path d="M10 21a2 2 0 0 0 4 0"></path>
          </svg>
          {unreadNotificationCount > 0 && (
            <span className={styles.notificationBadge}>
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </span>
          )}
        </a>
      )}
      <button
        className={`${styles.burgerButton} ${isMenuOpen ? styles.burgerButtonOpen : ""}`}
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="home-navigation-menu"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setIsMenuOpen((currentState) => !currentState)}
      >
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
      </button>
      <ul
        className={`${styles.listcontainer} ${isMenuOpen ? styles.listcontainerOpen : ""}`}
        id="home-navigation-menu"
      >
        <li className={styles.list}>
          <a href="/insights" onClick={closeMenu}>
            <h4>Insights</h4>
          </a>
        </li>
        <li className={styles.list}>
          <a href="/about" onClick={closeMenu}>
            <h4>About</h4>
          </a>
        </li>
        <li className={styles.list}>
          <a href="/privacy" onClick={closeMenu}>
            <h4>Privacy</h4>
          </a>
        </li>
        <li className={styles.list}>
          <a href="/terms" onClick={closeMenu}>
            <h4>Terms</h4>
          </a>
        </li>
        <li className={styles.list}>
          <a href="/responsible-play" onClick={closeMenu}>
            <h4>Play Safe</h4>
          </a>
        </li>
        {appContext.userProfile && appContext.userProfile.userName && (
          <li className={`${styles.list} ${styles.username}`}>
            <a href="/user" onClick={closeMenu}>
              <h4>{appContext.userProfile.userName}</h4>
            </a>
          </li>
        )}
        {appContext.userProfile && appContext.userProfile.userName && (
          <li className={`${styles.list} ${styles.username}`}>
            <a href="/" onClick={signOut}>
              <h4>sign out</h4>
            </a>
          </li>
        )}
        {!appContext.userProfile && (
          <li className={styles.list}>
            <a
              href="/login"
              onClick={(event) => {
                event.preventDefault();
                closeMenu();
                router.push("/login");
              }}
            >
              <h4>log in</h4>
            </a>
          </li>
        )}
        {!appContext.userProfile && (
          <li className={styles.list}>
            <a
              href="/signup"
              onClick={(event) => {
                event.preventDefault();
                closeMenu();
                router.push("/signup");
              }}
            >
              <h4>sign up</h4>
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

export default HomeMenu;
