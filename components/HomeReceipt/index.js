import styles from "./HomeReceipt.module.css";
import { useContext, useState, useEffect } from "react";
import AppContext from "../../helper/AppContext";
import BetEntry from "../Basic/BetEntry";
import { getCookie } from "../../helper/cookieHelper";
import {
  calculateCombinedOdd,
  calculatePotentialWin,
} from "../../helper/betHelpers";

function HomeReceipt({ isMobile }) {
  const { appContext, setAppContext } = useContext(AppContext);
  const hasActiveGameOdd = appContext.selectedEvents.length > 0;
  const size = useWindowSize();
  const isCircleButton = size.width <= 600;
  const combinedOdd = appContext.order.combinedOdd || 0;

  const clickHandler = () => {
    if (!hasActiveGameOdd) return;
    setAppContext((currentContext) => ({
      ...currentContext,
      showMobileOrder: !currentContext.showMobileOrder,
    }));
  };

  const removeEntry = (entry) => {
    setAppContext((currentContext) => {
      const nextSelections = currentContext.selectedEvents.filter(
        (selectedEvent) => selectedEvent.eventId !== entry.eventId
      );

      return {
        ...currentContext,
        selectedEvents: nextSelections,
        order: {
          ...currentContext.order,
          combinedOdd: calculateCombinedOdd(nextSelections),
          totalWin: calculatePotentialWin(
            currentContext.order.totalBet,
            nextSelections
          ),
        },
      };
    });
  };

  const updateStake = (value) => {
    const totalBet = parseFloat(value) || 0;

    setAppContext((currentContext) => ({
      ...currentContext,
      order: {
        ...currentContext.order,
        totalBet,
        combinedOdd: calculateCombinedOdd(currentContext.selectedEvents),
        totalWin: calculatePotentialWin(totalBet, currentContext.selectedEvents),
      },
    }));
  };

  const submitHandler = async () => {
    if (!hasActiveGameOdd || !appContext.userProfile?.userName) return;

    const selections = appContext.selectedEvents.map((selection) => ({
      fixture_id: selection.eventId,
      market: "match_winner",
      selection: selection.title.toLowerCase(),
      selection_code:
        selection.title.toLowerCase() === "home"
          ? 0
          : selection.title.toLowerCase() === "draw"
            ? 1
            : 2,
      odd_rate: parseFloat(selection.odd),
      fixture_state: "notstarted",
    }));

    const res = await fetch("https://service.yolofootball.com/api/orders", {
      method: "POST",
      body: JSON.stringify({
        order_type: selections.length > 1 ? "accumulator" : "single",
        stake: appContext.order.totalBet,
        combined_odd: combinedOdd,
        win_return: appContext.order.totalWin,
        selections,
      }),
      headers: {
        "Content-Type": "application/json",
        authorization: `${getCookie("access_token")}`,
      },
      credentials: "same-origin",
    });
    const data = await res.json();

    if (res.ok && data.message === "succeed") {
      alert("order is created");
      setAppContext((currentContext) => ({
        ...currentContext,
        selectedEvents: [],
        userActiveOrder: {
          ...currentContext.userActiveOrder,
          orders: [...(data.orders || []), ...(currentContext.userActiveOrder?.orders || [])],
        },
        order: {
          ...currentContext.order,
          totalBet: 0,
          combinedOdd: 0,
          totalWin: 0,
        },
      }));
    } else {
      alert("order is failed to create");
    }
  };

  const slipContent = (
    <>
      <div className={styles.receiptTitle}>
        <h4>Bet Basket</h4>
      </div>
      <br />
      <div className={styles.betContainer}>
        {!hasActiveGameOdd ? (
          <h4>
            <span>your basket is empty</span>
          </h4>
        ) : (
          appContext.selectedEvents.map((entry) => (
            <BetEntry
              key={entry.optionId}
              entry={entry}
              onRemove={removeEntry}
            />
          ))
        )}
      </div>
      <div className={styles.betStakeContainer}>
        <label
          className={styles.betStakeLabel}
          htmlFor={`stake-${isMobile ? "mobile" : "desktop"}`}
        >
          Stake
        </label>
        <input
          id={`stake-${isMobile ? "mobile" : "desktop"}`}
          className={styles.betStakeInput}
          type="number"
          placeholder="0"
          min="0"
          value={appContext.order.totalBet || ""}
          disabled={!hasActiveGameOdd}
          onChange={(e) => updateStake(e.target.value)}
        />
      </div>
      <div className={styles.betSummary}>
        <div className={styles.betSummaryTotal}>
          <span className={styles.betSummaryTotalTitle}>{"rate: "}</span>
          <span className={styles.betSummaryTotalNumber}>
            {combinedOdd ? combinedOdd.toFixed(2) : "0.00"}
          </span>
        </div>
        <div className={styles.betSummaryTotal}>
          <span className={styles.betSummaryTotalTitle}>{"bet: "}</span>
          <span className={styles.betSummaryTotalNumber}>
            {appContext.order.totalBet}
          </span>
        </div>
        <div className={styles.betSummaryTotal}>
          <span className={styles.betSummaryTotalTitle}>{"win: "}</span>
          <span className={styles.betSummaryTotalNumberWin}>
            {appContext.order.totalWin.toFixed(2)}
          </span>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return <div className={styles.receiptContainerMobile}>{slipContent}</div>;
  }

  return (
    <div className={styles.receiptContainer}>
      {isCircleButton ? (
        <button className={styles.mobileButton} onClick={clickHandler}>
          {hasActiveGameOdd ? "Slip" : "Cart"}
        </button>
      ) : (
        <div>
          {slipContent}
          <div className={styles.betButtonContainer}>
            <button
              className={styles.betButton}
              onClick={submitHandler}
              disabled={!hasActiveGameOdd}
            >
              submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export default HomeReceipt;
