import React, { useState, useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ACCESS_TOKEN_COOKIE_DAYS, setCookie } from "../../helper/cookieHelper";
import AppContext from "../../helper/AppContext";
import styles from "./SignupComponent.module.css";
import normalizeUserProfile from "../../helper/normalizeUserProfile";
import { readJsonSafely, getApiMessage } from "../../helper/apiResponse";
import {
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_VERSION,
} from "../../helper/privacyPolicy";

const SignupComponent = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectUrl = "https://www.yolofootball.com/";
  const { setAppContext } = useContext(AppContext);
  const router = useRouter();

  const passwordsMatch = password === confirmPassword && password !== "";
  const isFormValid =
    userName &&
    userEmail &&
    password &&
    confirmPassword &&
    passwordsMatch &&
    hasAcceptedPrivacyPolicy;

  async function onSubmitSignup(event) {
    event.preventDefault();
    if (!hasAcceptedPrivacyPolicy) {
      setSubmitError("Please review and accept the privacy notice before signing up.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("https://service.yolofootball.com/api/users/signup", {
        method: "POST",
        body: JSON.stringify({
          user_name: userName,
          user_email: userEmail,
          user_password: password,
          redirect_to: redirectUrl,
          privacy_policy_accepted: hasAcceptedPrivacyPolicy,
          privacy_policy_version: PRIVACY_POLICY_VERSION,
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
        setSubmitError(getApiMessage(data, "That account could not be created."));
      }
    } catch (error) {
      setSubmitError("Signup is temporarily unavailable. Please try again.");
    }
    setIsSubmitting(false);
  }

  return (
    <section className={styles.authShell}>
      <div className={styles.authIntro}>
        <p className={styles.eyebrow}>Create your account</p>
        <h1>Join yolofootball with a cleaner, guided matchday setup.</h1>
        <p className={styles.authCopy}>
          Save picks, build starter slips, track active orders, and unlock community custom odds
          with one account that keeps your football activity in one place.
        </p>
        <div className={styles.authHighlights}>
          <span>Starter slips and saved picks</span>
          <span>Custom odds participation</span>
          <span>Dashboard and future personalization</span>
        </div>
      </div>
      <div className={styles.authCard}>
        <div className={styles.authCardHeader}>
          <p className={styles.cardEyebrow}>Account setup</p>
          <h2>Sign up</h2>
          <p>Create an account to save your football activity and unlock logged-in features.</p>
        </div>
        <form className={styles.authForm} onSubmit={onSubmitSignup}>
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
            <span>Email Address</span>
            <input
              type="email"
              id="useremail"
              name="user_email"
              placeholder="Enter your email address"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
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
          <label className={styles.field}>
            <span>Confirm Password</span>
            <input
              type="password"
              id="confirmPassword"
              name="confirm_password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
            />
          </label>
          <input type="hidden" name="redirect_to" value={redirectUrl} />
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={hasAcceptedPrivacyPolicy}
              onChange={(event) => {
                setHasAcceptedPrivacyPolicy(event.target.checked);
              }}
            />
            <span>
              I agree to the <Link href="/privacy">Privacy Notice</Link> and consent to
              yolofootball storing and using my account and usage data to operate, secure,
              analyze, and improve the product. Last updated {PRIVACY_POLICY_LAST_UPDATED}.
            </span>
          </label>
          <p className={styles.legalMeta}>
            You should also review our <Link href="/terms">Terms of Use</Link> and{" "}
            <Link href="/responsible-play">Responsible Play</Link> guidance before using
            account-based features.
          </p>
          {!passwordsMatch && password !== "" && confirmPassword !== "" && (
            <div className={styles.formError}>Passwords do not match.</div>
          )}
          {submitError && <div className={styles.formError}>{submitError}</div>}
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className={styles.authMeta}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
};

export default SignupComponent;
