import OddButton from "../Basic/OddButton";
import styles from "./GameEntry.module.css";

function GameEntry({ id, home, away, odd, date }) {
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
          <OddButton data={{ eventId: id, title: "Home", odd: odd.home }} />
          <OddButton data={{ eventId: id, title: "Draw", odd: odd.draw }} />
          <OddButton data={{ eventId: id, title: "Away", odd: odd.away }} />
        </div>
      </div>
    </div>
  );
}

export default GameEntry;
