import styles from "./BetEntry.module.css";

function BetEntry({ entry, onRemove }) {
  return (
    <div
      className={styles.betEntry}
      data-id={entry.eventId}
      data-odd={entry.odd}
      data-title={entry.title}
    >
      <div className={styles.betEntryGameInfo}>
        <span className={styles.betEntryTitle}>{entry.gameTitle}</span>
        <span className={styles.betEntrySide}>{"@" + entry.title}</span>
      </div>
      <div className={styles.betEntryOdd}>
        <span className={styles.betEntryOddNumber}>{entry.odd}</span>
      </div>
      <button className={styles.betEntryRemove} onClick={() => onRemove(entry)}>
        Remove
      </button>
    </div>
  );
}

export default BetEntry;
