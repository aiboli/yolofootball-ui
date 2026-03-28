import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import SeoHead from "../SeoHead";
import styles from "./Privacy.module.css";
import { PRIVACY_POLICY_LAST_UPDATED } from "../../helper/privacyPolicy";

const policySections = [
  {
    title: "What we collect",
    items: [
      "Account details you provide, such as username, email address, password, and privacy-consent records.",
      "Activity data needed to run the product, such as your saved picks, orders, custom odds posts, and preference selections.",
      "Technical and usage data that helps us operate and protect the service, such as device, browser, log, and interaction information.",
    ],
  },
  {
    title: "How we use your data",
    items: [
      "To create and manage your account, authenticate you, and keep your profile, basket, orders, and community activity available.",
      "To operate, secure, troubleshoot, and improve yolofootball, including product analytics, performance monitoring, abuse prevention, and fraud detection.",
      "To understand which features people use so we can improve navigation, onboarding, content, and matchday recommendations.",
    ],
  },
  {
    title: "How we share data",
    items: [
      "We may share data with service providers that help us host, analyze, secure, or maintain the product.",
      "We may disclose data when reasonably necessary to comply with law, enforce our terms, or protect users, the service, or the public.",
      "We do not describe this notice as permission to sell your personal information or use it for unrelated third-party advertising.",
    ],
  },
  {
    title: "Retention and security",
    items: [
      "We keep personal data for as long as reasonably necessary to provide the service, maintain business records, resolve disputes, and meet legal or security needs.",
      "We use administrative, technical, and organizational safeguards intended to protect stored personal data, but no system can promise absolute security.",
      "Please avoid sharing unnecessary sensitive information through usernames, custom odds text, or other public-facing areas.",
    ],
  },
  {
    title: "Your choices",
    items: [
      "By creating an account, you acknowledge this notice and consent to our storage and use of your data for product operation, analytics, improvement, and security.",
      "If you do not agree with this notice, do not create an account or use authenticated features.",
      "If you need account or privacy support, provide a monitored privacy contact method before production launch and have counsel review this notice.",
    ],
  },
];

function Privacy() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <SeoHead
        title="Privacy Notice"
        description="Read the yolofootball privacy notice, including what data we collect, how we use it, and what you consent to when creating an account."
        path="/privacy"
      />
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <HomeLogo />
          <HomeMenu />
        </nav>
      </div>

      <main className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Privacy Notice</p>
            <h1 className={styles.title}>A short-form privacy notice for yolofootball accounts.</h1>
            <p className={styles.description}>
              This notice explains what account and usage data we collect, why we use it, and what
              you consent to when you create an account or use logged-in product features.
            </p>
            <div className={styles.heroTags}>
              <span>Last updated {PRIVACY_POLICY_LAST_UPDATED}</span>
              <span>Applies to account signup and logged-in features</span>
            </div>
          </div>

          <article className={styles.summaryCard}>
            <p className={styles.cardEyebrow}>In plain language</p>
            <h2>What you are agreeing to</h2>
            <ul className={styles.summaryList}>
              <li>We store the account data needed to run your profile and matchday activity.</li>
              <li>We analyze usage data to improve product quality, onboarding, and feature design.</li>
              <li>We keep logs and security signals to protect the service and investigate misuse.</li>
            </ul>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Notice details</p>
            <h2>Current privacy commitments</h2>
          </div>

          <div className={styles.policyGrid}>
            {policySections.map((section) => (
              <article key={section.title} className={styles.policyCard}>
                <h3>{section.title}</h3>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.noticeBanner}>
          <p className={styles.sectionEyebrow}>Risk reduction</p>
          <h2>Review this notice with qualified counsel before a production launch.</h2>
          <p>
            This page improves transparency and records affirmative consent, but privacy law varies
            by jurisdiction, product behavior, and monetization model. Any production launch should
            be reviewed against the specific regions, analytics vendors, and retention practices you
            plan to use.
          </p>
        </section>
      </main>

      <div className={styles.footer}>
        <h5>&reg;{currentYear} Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default Privacy;
