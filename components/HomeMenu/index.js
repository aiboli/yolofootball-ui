import styles from "./HomeMenu.module.css";

function HomeMenu() {
  return (
    <div className={styles.homemenu}>
      <ul className={styles.listcontainer}>
        <li className={styles.list}>
          <a href="/">
            <h4>About</h4>
          </a>
        </li>
        <li className={styles.list}>
          <a href="/">
            <h4>log in</h4>
          </a>
        </li>
        <li className={styles.list}>
          <a href="/">
            <h4>sign up</h4>
          </a>
        </li>
      </ul>
    </div>
  );
}

export default HomeMenu;
