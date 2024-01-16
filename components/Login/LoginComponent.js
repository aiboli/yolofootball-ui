import React from "react";
import styles from "./LoginComponent.module.css";

const LoginComponent = () => {
  return (
    <div className={styles.LoginComponentContainer}>
      <div className={styles.LoginComponentTitle}>
        <h4>Login</h4>
      </div>
      <div className={styles.LoginComponentForm}>
        <form
          action="https://service.yolofootball.com/api/users/signin"
          method="POST"
        >
          <div className={styles.LoginComponentInputContainer}>
            <input
              type="text"
              id="username"
              name="user_name"
              placeholder="Username"
            />
            <input
              type="password"
              id="password"
              name="user_password"
              placeholder="Password"
            />
            <input
              type="hidden"
              name="redirect_to"
              value="https://www.yolofootball.com/"
            />
          </div>
          <input type="submit" value="Login" />
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;
