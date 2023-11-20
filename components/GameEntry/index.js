import OddButton from "../Basic/OddButton";
import styles from "./GameEntry.module.css";

function GameEntry({ home, away, odd, date }) {
  return (
    <div className={styles.gameEntry}>
      <div className={styles.gameEntryTitle}>
        <span>⚽</span>
        <h5>
          {home} vs {away}
        </h5>
      </div>
      <div className={styles.gameEntrySubTitle}>
        <span className={styles.gameDate}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
      <div className={styles.gameEntryBody}>
        <div className={styles.gameOddButtonGroup}>
          <OddButton data={{ title: "Home", odd: odd.home }} />
          <OddButton data={{ title: "Draw", odd: odd.draw }} />
          <OddButton data={{ title: "Away", odd: odd.away }} />
        </div>
      </div>
    </div>
  );
}

export default GameEntry;
