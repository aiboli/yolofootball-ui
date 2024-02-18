import React, { useState } from "react";
import { cookies } from "next/headers";
import styles from "./LoginComponent.module.css";

const LoginComponent = () => {
  let [userName, setUserName] = useState("");
  let [password, setPassword] = useState("");
  let [redirectUrl, setRedirectUrl] = useState("https://www.yolofootball.com/");

  async function onSubmit() {
    event.preventDefault();
    const res = await fetch(
      "https://service.yolofootball.com/api/users/signin",
      {
        method: "POST",
        body: JSON.stringify({
          user_name: userName,
          user_password: password,
          redirect_to: redirectUrl,
        }),
        redirect: "follow",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      }
    );
    const data = await res.json();
    if (data.message === "succeed") {
      window.location.href = data.redirectURL;
      cookies().set("access_token", "data.accessToken");
    }
  }
  return (
    <div className={styles.LoginComponentContainer}>
      <div className={styles.LoginComponentTitle}>
        <h4>Login</h4>
      </div>
      <div className={styles.LoginComponentForm}>
        <form onSubmit={onSubmit}>
          <div className={styles.LoginComponentInputContainer}>
            <input
              type="text"
              id="username"
              name="user_name"
              placeholder="Username"
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
            <input
              type="password"
              id="password"
              name="user_password"
              placeholder="Password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
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
