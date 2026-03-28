import React from "react";
import HomeMenu from "../HomeMenu";
import HomeLogo from "../HomeLogo";
import SiteFooter from "../SiteFooter";
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
      <SiteFooter />
    </>
  );
};

export default Login;
