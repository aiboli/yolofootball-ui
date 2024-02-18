import styles from "./HomeMenu.module.css";
import AppContext from "../../helper/AppContext";

function HomeMenu() {
  const { appContext, setAppContext } = useContext(AppContext);
  return (
    <div className={styles.homemenu}>
      <ul className={styles.listcontainer}>
        <li className={styles.list}>
          <a href="/">
            <h4>About</h4>
          </a>
        </li>
        {appContext.userProfile && appContext.userProfile.userName && (
          <li className={styles.list}>
            <a href="/user">
              <h4>{appContext.userProfile.userName}</h4>
            </a>
          </li>
        )}
        {!appContext.userProfile && (
          <li className={styles.list}>
            <a href="/login">
              <h4>log in</h4>
            </a>
          </li>
        )}
        {!appContext.userProfile && (
          <li className={styles.list}>
            <a href="/">
              <h4>sign up</h4>
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

export default HomeMenu;
