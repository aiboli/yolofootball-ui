import styles from "./HomeOrder.module.css";
import { useEffect, useContext } from "react";
import { getCookie } from "../../helper/cookieHelper";
import AppContext from "../../helper/AppContext";

function HomeOrder() {
  const { appContext, setAppContext } = useContext(AppContext);
  const hasUserProfile = !!appContext?.userProfile?.userName;

  const homeOrAway = (betResult) => {
    return betResult === 2 ? "Away" : betResult === 1 ? "Draw" : "Home";
  };

  const renderOrderSummary = (item) => {
    if (Array.isArray(item.selection_details) && item.selection_details.length > 1) {
      return (
        <>
          <h5>
            {item.selection_details.length} picks @{" "}
            <span>{Number(item.odd_rate || 0).toFixed(2)}</span>
          </h5>
          <p>
            {item.selection_details
              .map((selection) => {
                const teams = selection.fixture_details?.teams;
                return `${teams?.home?.name} vs ${teams?.away?.name} (${homeOrAway(
                  selection.bet_result
                )})`;
              })
              .join(" | ")}
            {" bet: "}
            {item.odd_mount}
            {" win: "}
            <span className={styles.userOrderWin}>{item.win_return}</span>
          </p>
        </>
      );
    }

    return (
      <>
        <h5>
          {item?.fixture_details?.league?.name}
          {" on "}
          <span>
            {new Date(item?.fixture_details?.fixture?.date).toLocaleDateString()}
          </span>
        </h5>
        <p>
          {item?.fixture_details?.teams?.home?.name +
            " vs " +
            item?.fixture_details?.teams?.away?.name +
            " @ " +
            item?.odd_rate +
            " " +
            homeOrAway(item?.bet_result) +
            " bet: " +
            item?.odd_mount +
            " win: "}
          <span className={styles.userOrderWin}>{item?.win_return}</span>
        </p>
      </>
    );
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      const res = await fetch(
        "https://service.yolofootball.com/api/orders/getHydratedOrders",
        {
          method: "POST",
          body: JSON.stringify({
            order_state: "pending",
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `${getCookie("access_token")}`,
          },
          credentials: "same-origin",
        }
      );
      const data = await res.json();

      if (!isMounted) {
        return;
      }

      setAppContext((currentContext) => ({
        ...currentContext,
        userActiveOrder: {
          ...currentContext.userActiveOrder,
          orders: Array.isArray(data) ? data : [],
        },
      }));
    }

    if (getCookie("access_token") && hasUserProfile) {
      fetchOrder().catch((error) => {
        console.error("Failed to load active orders", error);
        if (!isMounted) {
          return;
        }
        setAppContext((currentContext) => ({
          ...currentContext,
          userActiveOrder: {
            ...currentContext.userActiveOrder,
            orders: [],
          },
        }));
      });
    }

    return () => {
      isMounted = false;
    };
  }, [hasUserProfile, setAppContext]);

  return (
    <div className={styles.userOrderContainer}>
      <h4 className={styles.userOrderTitle}>Your Order</h4>
      <div>
        {appContext.userActiveOrder?.orders?.map((item, index) => (
          <div key={item.id || item.orderdate || index}>
            <div className={styles.userOrderItem}>
              <div className={styles.userOrderItemLeft}>
                <img
                  src={
                    item?.fixture_details?.league?.logo ||
                    item?.selection_details?.[0]?.fixture_details?.league?.logo
                  }
                  alt="order"
                  className={styles.userOrderItemImg}
                />
                <div>{renderOrderSummary(item)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeOrder;
