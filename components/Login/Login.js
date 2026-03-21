import React from "react";
import HomeMenu from "../HomeMenu";
import HomeLogo from "../HomeLogo";
import styles from "./Login.module.css";
import LoginComponent from "./LoginComponent";
import SeoHead from "../SeoHead";

const Login = () => {
  return (
    <>
      <SeoHead
        title="Log in"
        description="Log in to yolofootball to manage your football picks, active orders, and betting basket."
        path="/login"
        noindex={true}
      />
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <HomeLogo />
          <HomeMenu />
        </nav>
      </div>
      <div className={styles.content}>
        <LoginComponent />
      </div>
      <div className={styles.footer}>
        <h5>&reg;2023 Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
};

export default Login;
