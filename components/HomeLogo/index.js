import styles from "./HomeLogo.module.css";

function HomeLogo() {
  return (
    <div className={styles.homelogo}>
      <a className={styles.homelogolink} href="/">
        <img className={styles.logo} src="./assets/logo/logo.png"></img>
        <h2 className={styles.title}>Yolofootball</h2>
      </a>
    </div>
  );
}

export default HomeLogo;
