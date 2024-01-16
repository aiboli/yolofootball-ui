import styles from "./HomeReceipt.module.css";
import { useContext, useState, useEffect } from "react";
import AppContext from "../../helper/AppContext";
import BetEntry from "../Basic/BetEntry";

function HomeReceipt({ isMobile }) {
  const { appContext, setAppContext } = useContext(AppContext);
  const hasActiveGameOdd = appContext.selectedEvents.length > 0;
  const activeGameOdd = hasActiveGameOdd && appContext.selectedEvents[0];
  let size = useWindowSize();
  let isCircleButton = size.width <= 600;

  const clickHandler = () => {
    if (!hasActiveGameOdd) return;
    setAppContext({
      ...appContext,
      showMobileOrder: !appContext.showMobileOrder,
    });
  };
  if (isMobile) {
    return (
      <div className={styles.receiptContainerMobile}>
        <div className={styles.receiptTitle}>
          <h4>Bet Basket</h4>
        </div>
        <br />
        <div className={styles.betContainer}>
          <h4>
            {!hasActiveGameOdd ? (
              "your basket is empty"
            ) : (
              <BetEntry entry={activeGameOdd}></BetEntry>
            )}
          </h4>
        </div>
        <div className={styles.betSummary}>
          <div className={styles.betSummaryTotal}>
            <span className={styles.betSummaryTotalTitle}>{"bet: "}</span>
            <span className={styles.betSummaryTotalNumber}>
              {appContext.order.totalBet}
            </span>
          </div>
          <div className={styles.betSummaryTotal}>
            <span className={styles.betSummaryTotalTitle}>{"win: "}</span>
            <span className={styles.betSummaryTotalNumberWin}>
              {appContext.order.totalWin}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.receiptContainer}>
      {isCircleButton && (
        <button className={styles.mobileButton} onClick={() => clickHandler()}>
          {hasActiveGameOdd ? "📃" : "🛒"}
        </button>
      )}
      {!isCircleButton && (
        <div>
          <div className={styles.receiptTitle}>
            <h4>Bet Basket</h4>
          </div>
          <br />
          <div className={styles.betContainer}>
            <h4>
              {!hasActiveGameOdd ? (
                "your basket is empty"
              ) : (
                <BetEntry entry={activeGameOdd}></BetEntry>
              )}
            </h4>
          </div>
          <div className={styles.betSummary}>
            <div className={styles.betSummaryTotal}>
              <span className={styles.betSummaryTotalTitle}>{"bet: "}</span>
              <span className={styles.betSummaryTotalNumber}>
                {appContext.order.totalBet}
              </span>
            </div>
            <div className={styles.betSummaryTotal}>
              <span className={styles.betSummaryTotalTitle}>{"win: "}</span>
              <span className={styles.betSummaryTotalNumberWin}>
                {appContext.order.totalWin}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
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
