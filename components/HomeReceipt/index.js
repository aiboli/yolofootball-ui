import styles from "./HomeReceipt.module.css";
import { useContext, useState, useEffect } from "react";
import AppContext from "../../pages/AppContext";

function HomeReceipt() {
  const { appContext, setAppContext } = useContext(AppContext);
  const hasActiveGameOdd = appContext.selectedEvents.length > 0;
  const activeGameOdd = hasActiveGameOdd && appContext.selectedEvents[0];
  let size = useWindowSize();
  let isCircleButton = size.width <= 600;
  return hasActiveGameOdd ? (
    <div className={styles.receiptContainer}>
      {isCircleButton && <h1>1</h1>}
      {!isCircleButton && (
        <div>
          <h4>You have selected: </h4>
          <br />
          <p>{`${activeGameOdd.optionId} ${activeGameOdd.title}@${activeGameOdd.odd}`}</p>
        </div>
      )}
    </div>
  ) : (
    <div className={styles.receiptContainer}>
      {isCircleButton && <h1>+</h1>}
    </div>
  );
}

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export default HomeReceipt;
