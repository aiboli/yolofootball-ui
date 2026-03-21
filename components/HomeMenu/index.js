import styles from "./HomeMenu.module.css";
import AppContext from "../../helper/AppContext";
import { useContext } from "react";
import { useRouter } from "next/router";
import { eraseCookie } from "../../helper/cookieHelper";

function HomeMenu() {
  const { appContext, setAppContext } = useContext(AppContext);
  const router = useRouter();

  const signOut = (event) => {
    event.preventDefault();
    eraseCookie("access_token");
    setAppContext((currentContext) => ({
      ...currentContext,
      userProfile: undefined,
      userActiveOrder: {
        orders: [],
      },
      selectedEvents: [],
      order: {
        totalBet: 0,
        combinedOdd: 0,
        totalWin: 0,
      },
    }));
    router.push("/");
  };

  return (
    <div className={styles.homemenu}>
      <ul className={styles.listcontainer}>
        <li className={styles.list}>
          <a href="/about">
            <h4>About</h4>
          </a>
        </li>
        {appContext.userProfile && appContext.userProfile.userName && (
          <li className={`${styles.list} ${styles.username}`}>
            <a href="/user">
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
