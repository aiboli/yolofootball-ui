import styles from "./HomeOrder.module.css";
import { useEffect, useContext } from "react";
import { getCookie } from "../../helper/cookieHelper";
import AppContext from "../../helper/AppContext";

function HomeOrder() {
  const { appContext, setAppContext } = useContext(AppContext);
  const userOrderIds = appContext?.userProfile?.userOrderIds;

  const homeOrAway = (betResult) => {
    return betResult === 2 ? "Away" : betResult === 1 ? "Draw" : "Home";
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      const res = await fetch(
        "https://service.yolofootball.com/api/orders/getHydratedOrders",
        {
          method: "POST",
          body: JSON.stringify({
            order_ids: userOrderIds,
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

    if (getCookie("access_token") && userOrderIds?.length) {
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
  }, [setAppContext, userOrderIds]);

  return (
    <div className={styles.userOrderContainer}>
      <h4 className={styles.userOrderTitle}>Your Order</h4>
      <div>
        {appContext.userActiveOrder?.orders?.map((item, index) => (
          <div key={index}>
            <div className={styles.userOrderItem}>
              <div className={styles.userOrderItemLeft}>
                <img
                  src={item?.fixture_details?.league?.logo}
                  alt="product"
                  className={styles.userOrderItemImg}
                />
                <div>
                  <h5>
                    {item?.fixture_details?.league?.name}
                    {" on "}
                    <span>
                      {new Date(
                        item?.fixture_details?.fixture?.date
                      ).toLocaleDateString()}
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
                    <span className={styles.userOrderWin}>
                      {item?.win_return}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeOrder;
