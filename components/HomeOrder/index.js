import styles from "./HomeOrder.module.css";
import { useEffect, useContext } from "react";
import { getCookie } from "../../helper/cookieHelper";
import AppContext from "../../helper/AppContext";

function HomeOrder({ order }) {
  const { appContext, setAppContext } = useContext(AppContext);
  const userOrderIds = appContext?.userProfile?.userOrderIds;

  const homeOrAway = (betResult) => {
    return betResult == 2 ? "Away" : betResult == 1 ? "Draw" : "Home";
  };

  useEffect(() => {
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
      console.log(data);
      if (data && data.length > 0) {
        setAppContext({
          ...appContext,
          userActiveOrder: {
            ...appContext.userActiveOrder,
            orders: data,
          },
        });
      } else {
        setAppContext({
          ...appContext,
          userActiveOrder: {
            ...appContext.userActiveOrder,
            orders: [],
          },
        });
      }
      return;
    }
    if (!!getCookie("access_token") && userOrderIds) {
      fetchOrder();
    }
    return () => {
      console.log("Order fetch unmounted");
    };
  }, [userOrderIds]);
  console.log(appContext.userActiveOrder);
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
