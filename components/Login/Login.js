import React from "react";
import HomeMenu from "../HomeMenu";
import HomeLogo from "../HomeLogo";
import Head from "next/head";
import styles from "./Login.module.css";
import LoginComponent from "./LoginComponent";

const Login = () => {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto"
          rel="stylesheet"
        />
      </Head>
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
        <h5>®2023 Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
};

export default Login;
