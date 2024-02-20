import React, { useState, useContext } from "react";
import { setCookie } from "../../helper/cookieHelper";
import AppContext from "../../helper/AppContext";
import styles from "./SignupComponent.module.css";
import { useRouter } from "next/navigation";

const SignupComponent = () => {
  let [userName, setUserName] = useState("");
  let [userEmail, setUserEmail] = useState("");
  let [password, setPassword] = useState("");
  let [redirectUrl, setRedirectUrl] = useState("https://www.yolofootball.com/");
  const { appContext, setAppContext } = useContext(AppContext);
  const { push } = useRouter();
  console.log(encodeURIComponent(userEmail));

  async function onSubmitSignup() {
    event.preventDefault();
    const res = await fetch(
      "https://service.yolofootball.com/api/users/signup",
      {
        method: "POST",
        body: JSON.stringify({
          user_name: userName,
          user_email: userEmail,
          user_password: password,
          redirect_to: redirectUrl,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      }
    );
    console.log(res);
    const data = await res.json();
    if (data.message === "succeed") {
      setCookie("access_token", data.accessToken, 7);
      setAppContext({
        ...appContext,
        userProfile: data.userProfile,
      });
      push("/");
    } else {
      alert("account has been registered");
    }
  }
  return (
    <div className={styles.SignupComponentContainer}>
      <div className={styles.SignupComponentTitle}>
        <h4>Signup</h4>
      </div>
      <div className={styles.SignupComponentForm}>
        <form onSubmit={onSubmitSignup}>
          <div className={styles.SignupComponentInputContainer}>
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
              type="email"
              id="useremail"
              name="user_email"
              placeholder="UserEmail"
              onChange={(e) => {
                setUserEmail(e.target.value);
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
          <input type="submit" value="Signup" />
        </form>
      </div>
    </div>
  );
};

export default SignupComponent;
