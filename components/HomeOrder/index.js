import React from "react";
import styles from "./HomeOrder.module.css";
import { useEffect } from "react";
import { getCookie } from "../../helper/cookieHelper";

const HomeOrder = ({ order }) => {
  useEffect(async () => {
    // const res = await fetch(
    //   "https://service.yolofootball.com/api/orders/GetOrders",
    //   {
    //     method: "POST",
    //     body: JSON.stringify({}),
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `${getCookie("access_token")}`,
    //     },
    //     credentials: "same-origin",
    //   }
    // );
    // const data = await res.json();
    // console.log(data);
    // return;
  }, []);
  return (
    <div className={styles.userOrderContainer}>
      <h4 className={styles.userOrderTitle}>Your Order</h4>
      <ul className={styles.userOrderList}>
        {order.map((item, index) => (
          <li key={index} className={styles.userOrderItem}>
            {item.name} - {item.quantity} x ${item.price}
          </li>
        ))}
      </ul>
      <div className={styles.userOrderTotal}>
        Total: $
        {order
          .reduce((total, item) => total + item.quantity * item.price, 0)
          .toFixed(2)}
      </div>
    </div>
  );
};

export default HomeOrder;
