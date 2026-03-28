import styles from "./SiteFooter.module.css";

function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.links}>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/responsible-play">Play Safe</a>
        </div>
        <h5>&reg;{currentYear} Yolofootball.com. All rights reserved.</h5>
      </div>
    </footer>
  );
}

export default SiteFooter;
