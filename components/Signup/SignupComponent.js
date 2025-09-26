import React, { useState, useContext } from "react";
import { setCookie } from "../../helper/cookieHelper";
import AppContext from "../../helper/AppContext";
import styles from "./SignupComponent.module.css";
import { useRouter } from "next/navigation";

const SignupComponent = () => {
  let [userName, setUserName] = useState("");
  let [userEmail, setUserEmail] = useState("");
  let [password, setPassword] = useState("");
  let [confirmPassword, setConfirmPassword] = useState("");
  let [redirectUrl, setRedirectUrl] = useState("https://www.yolofootball.com/");
  const { appContext, setAppContext } = useContext(AppContext);
  const { push } = useRouter();
  console.log(encodeURIComponent(userEmail));

  const passwordsMatch = password === confirmPassword && password !== "";
  const isFormValid =
    userName && userEmail && password && confirmPassword && passwordsMatch;

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
            <div className={styles.SignupComponentInputGroup}>
              <label htmlFor="username" className={styles.SignupComponentLabel}>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="user_name"
                placeholder="Enter your username"
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
              />
            </div>
            <div className={styles.SignupComponentInputGroup}>
              <label
                htmlFor="useremail"
                className={styles.SignupComponentLabel}
              >
                Email Address
              </label>
              <input
                type="email"
                id="useremail"
                name="user_email"
                placeholder="Enter your email address"
                onChange={(e) => {
                  setUserEmail(e.target.value);
                }}
              />
            </div>
            <div className={styles.SignupComponentInputGroup}>
              <label htmlFor="password" className={styles.SignupComponentLabel}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="user_password"
                placeholder="Enter your password"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <div className={styles.SignupComponentInputGroup}>
              <label
                htmlFor="confirmPassword"
                className={styles.SignupComponentLabel}
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirm_password"
                placeholder="Confirm your password"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
            </div>
            <input
              type="hidden"
              name="redirect_to"
              value="https://www.yolofootball.com/"
            />
            {!passwordsMatch && password !== "" && confirmPassword !== "" && (
              <div className={styles.SignupComponentError}>
                Passwords do not match
              </div>
            )}
            <button
              type="submit"
              className={`${styles.SignupComponentButton} ${
                !isFormValid ? styles.SignupComponentButtonDisabled : ""
              }`}
              disabled={!isFormValid}
            >
              Signup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupComponent;
