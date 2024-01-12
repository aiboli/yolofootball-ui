import styles from "./OddButton.module.css";
import { useContext, useState } from "react";
import AppContext from "../../../helper/AppContext";

function OddButton({ data }) {
  const { appContext, setAppContext } = useContext(AppContext);
  const [selected, setSelected] = useState(false);
  const currentOption =
    appContext.selectedEvents[0] && appContext.selectedEvents[0].optionId;
  const currentOptionIsSelected =
    currentOption == `${data.eventId}-${data.title}`;
  if (!currentOptionIsSelected && selected) {
    setSelected(false);
  }
  return (
    <button
      className={`${styles.oddButton} ${selected ? styles.selected : ""}`}
      onClick={() => {
        if (selected) {
          setAppContext({
            ...appContext,
            selectedEvents: []
          });
        } else {
          setAppContext({
            ...appContext,
            selectedEvents: [
              {
                eventId: data.eventId,
                optionId: `${data.eventId}-${data.title}`,
                title: data.title,
                odd: data.odd
              }
            ]
          });
          setSelected(true);
        }
      }}
    >
      <span className={styles.oddTitle}>{data.title}</span>
      <br />
      <span className={styles.oddNumber}>{data.odd}</span>
    </button>
  );
}

export default OddButton;
