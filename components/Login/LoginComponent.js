import React, { useState, useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ACCESS_TOKEN_COOKIE_DAYS, setCookie } from "../../helper/cookieHelper";
import AppContext from "../../helper/AppContext";
import styles from "./LoginComponent.module.css";
import normalizeUserProfile from "../../helper/normalizeUserProfile";
import { readJsonSafely, getApiMessage } from "../../helper/apiResponse";

const LoginComponent = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectUrl = "https://www.yolofootball.com/";
  const { setAppContext } = useContext(AppContext);
  const router = useRouter();

  async function onSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("https://service.yolofootball.com/api/users/signin", {
        method: "POST",
        body: JSON.stringify({
          user_name: userName,
          user_password: password,
          redirect_to: redirectUrl,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      });
      const data = await readJsonSafely(res);
      if (data?.message === "succeed") {
        setCookie("access_token", data.accessToken, ACCESS_TOKEN_COOKIE_DAYS);
        setAppContext((currentContext) => ({
          ...currentContext,
          userProfile: normalizeUserProfile(data.userProfile),
          isAuthResolved: true,
        }));
        router.push("/");
      } else {
        setSubmitError(getApiMessage(data, "The username or password was incorrect."));
      }
    } catch (error) {
      setSubmitError("Login is temporarily unavailable. Please try again.");
    }
    setIsSubmitting(false);
  }

  return (
    <section className={styles.authShell}>
      <div className={styles.authIntro}>
        <p className={styles.eyebrow}>Welcome back</p>
        <h1>Log in to pick up your matchday flow.</h1>
        <p className={styles.authCopy}>
          Jump back into your saved basket, active orders, custom odds, and account dashboard
          without losing the cleaner yolofootball matchday experience.
        </p>
        <div className={styles.authHighlights}>
          <span>Active slips and orders</span>
          <span>Custom odds activity</span>
          <span>Personal matchday dashboard</span>
        </div>
      </div>
      <div className={styles.authCard}>
        <div className={styles.authCardHeader}>
          <p className={styles.cardEyebrow}>Account access</p>
          <h2>Log in</h2>
          <p>Use your username and password to continue where you left off.</p>
        </div>
        <form className={styles.authForm} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span>Username</span>
            <input
              type="text"
              id="username"
              name="user_name"
              placeholder="Enter your username"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              id="password"
              name="user_password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </label>
          <input type="hidden" name="redirect_to" value={redirectUrl} />
          {submitError && <p className={styles.formError}>{submitError}</p>}
          <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className={styles.authMeta}>
          New to yolofootball? <Link href="/signup">Create an account</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginComponent;
