import React, { useState, useContext } from "react";
import { setCookie } from "../../helper/cookieHelper";
import AppContext from "../../helper/AppContext";
import styles from "./LoginComponent.module.css";
import { useRouter } from "next/navigation";

const LoginComponent = () => {
  let [userName, setUserName] = useState("");
  let [password, setPassword] = useState("");
  let [redirectUrl, setRedirectUrl] = useState("https://www.yolofootball.com/");
  const { appContext, setAppContext } = useContext(AppContext);
  const { push } = useRouter();

  async function onSubmit() {
    event.preventDefault();
    const res = await fetch(
      "https://service.yolofootball.com/api/users/signin",
      {
        method: "POST",
        body: JSON.stringify({
          user_name: userName,
          user_password: password,
          redirect_to: redirectUrl
        }),
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      }
    );
    const data = await res.json();
    if (data.message === "succeed") {
      setCookie("access_token", data.accessToken, 7);
      setAppContext({
        ...appContext,
        userProfile: data.userProfile
      });
      push("/");
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
              onChange={e => {
                setUserName(e.target.value);
              }}
            />
            <input
              type="password"
              id="password"
              name="user_password"
              placeholder="Password"
              onChange={e => {
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
