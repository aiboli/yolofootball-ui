import styles from "./BetEntry.module.css";
import { useContext, useState } from "react";
import AppContext from "../../../helper/AppContext";

function BetEntry({ entry }) {
  const { appContext, setAppContext } = useContext(AppContext);
  const entryOdd = entry.odd;
  const entrySide = entry.title;
  const entryGameTitle = entry.gameTitle;

  const calculateWin = (e, odd) => {
    const bet = e.target.value;
    return bet * parseFloat(odd);
  };
  return (
    <div
      className={styles.betEntry}
      data-id={entry.eventId}
      data-odd={entry.odd}
      data-title={entry.title}
    >
      <div className={styles.betEntryGameInfo}>
        <span className={styles.betEntryTitle}>{entryGameTitle}</span>
        <span className={styles.betEntrySide}>{"@" + entrySide}</span>
      </div>
      <div className={styles.betEntryOdd}>
        <span className={styles.betEntryOddNumber}>{entryOdd}</span>
      </div>
      <div className={styles.betEntryInputContainer}>
        <input
          className={styles.betEntryInput}
          type="number"
          placeholder="0"
          min="0"
          onChange={(e) => {
            setAppContext({
              ...appContext,
              order: {
                ...appContext.order,
                totalBet: parseFloat(e.target.value),
                totalWin: calculateWin(e, entryOdd),
              },
            });
          }}
        />
      </div>
    </div>
  );
}

export default BetEntry;
