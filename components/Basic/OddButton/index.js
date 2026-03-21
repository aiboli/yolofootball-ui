import styles from "./OddButton.module.css";
import { useContext } from "react";
import AppContext from "../../../helper/AppContext";
import {
  calculateCombinedOdd,
  calculatePotentialWin,
} from "../../../helper/betHelpers";

function OddButton({ data }) {
  const { appContext, setAppContext } = useContext(AppContext);
  const currentOption = appContext.selectedEvents.find(
    (selectedEvent) => selectedEvent.eventId === data.eventId
  );
  const currentOptionIsSelected =
    currentOption?.optionId === `${data.eventId}-${data.title}`;

  return (
    <button
      className={`${styles.oddButton} ${
        currentOptionIsSelected ? styles.selected : ""
      }`}
      onClick={() => {
        setAppContext((currentContext) => {
          const existingSelections = currentContext.selectedEvents || [];
          const selectionIndex = existingSelections.findIndex(
            (selectedEvent) => selectedEvent.eventId === data.eventId
          );

          let nextSelections = existingSelections;
          if (selectionIndex >= 0) {
            // Keep one selection per fixture: re-click removes it, new outcome replaces it.
            const nextSelection = {
              eventId: data.eventId,
              optionId: `${data.eventId}-${data.title}`,
              title: data.title,
              odd: data.odd,
              gameTitle: data.gameTitle,
            };

            if (
              existingSelections[selectionIndex].optionId === nextSelection.optionId
            ) {
              nextSelections = existingSelections.filter(
                (selectedEvent) => selectedEvent.eventId !== data.eventId
              );
            } else {
              nextSelections = [...existingSelections];
              nextSelections[selectionIndex] = nextSelection;
            }
          } else {
            nextSelections = [
              ...existingSelections,
              {
                eventId: data.eventId,
                optionId: `${data.eventId}-${data.title}`,
                title: data.title,
                odd: data.odd,
                gameTitle: data.gameTitle,
              },
            ];
          }

          return {
            ...currentContext,
            selectedEvents: nextSelections,
            order: {
              ...currentContext.order,
              // Recalculate the slip whenever picks change.
              combinedOdd: calculateCombinedOdd(nextSelections),
              totalWin: calculatePotentialWin(
                currentContext.order.totalBet,
                nextSelections
              ),
            },
          };
        });
      }}
    >
      <span className={styles.oddTitle}>{data.title}</span>
      <br />
      <span className={styles.oddNumber}>{data.odd}</span>
    </button>
  );
}

export default OddButton;
