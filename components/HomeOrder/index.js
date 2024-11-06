import styles from "./HomeOrder.module.css";
import { useEffect, useContext } from "react";
import { getCookie } from "../../helper/cookieHelper";
import AppContext from "../../helper/AppContext";

function HomeOrder({ order }) {
  const { appContext, setAppContext } = useContext(AppContext);
  const userOrderIds = appContext?.userProfile?.userOrderIds;
  useEffect(() => {
    async function fetchOrder() {
      const res = await fetch(
        "https://service.yolofootball.com/api/orders/getOrders",
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
            <p>{item.fixture_id}</p>
            <p>{item.odd_mount}</p>
            <p>{item.odd_rate}</p>
            <p>{item.win_return}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeOrder;
