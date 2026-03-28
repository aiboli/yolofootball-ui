import React from "react";
import HomeMenu from "../HomeMenu";
import HomeLogo from "../HomeLogo";
import SiteFooter from "../SiteFooter";
import styles from "./Signup.module.css";
import SignupComponent from "./SignupComponent";
import SeoHead from "../SeoHead";

const Signup = () => {
  return (
    <>
      <SeoHead
        title="Sign up"
        description="Create a yolofootball account to save football picks, track active slips, and manage your betting profile."
        path="/signup"
        noindex={true}
      />
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <HomeLogo />
          <HomeMenu />
        </nav>
      </div>
      <div className={styles.content}>
        <SignupComponent />
      </div>
      <SiteFooter />
    </>
  );
};

export default Signup;
