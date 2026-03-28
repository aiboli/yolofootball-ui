import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import SeoHead from "../SeoHead";
import styles from "../Privacy/Privacy.module.css";

const sections = [
  {
    title: "Using the service",
    items: [
      "yolofootball provides football-related product features such as fixture browsing, picks, free predictions, custom odds, and account tools.",
      "You must provide accurate account information and keep your login credentials secure.",
      "You are responsible for activity that occurs through your account unless you promptly report unauthorized access.",
    ],
  },
  {
    title: "Community and user conduct",
    items: [
      "Do not misuse custom odds, account tools, or any community-facing feature to harass, deceive, spam, or manipulate other users.",
      "Do not attempt to interfere with the service, scrape protected areas, exploit bugs, or bypass access controls.",
      "We may suspend, restrict, or remove accounts or content that harm the service, other users, or our legal obligations.",
    ],
  },
  {
    title: "Predictions, picks, and no guarantees",
    items: [
      "Free predictions, content cards, starter slips, and community activity are informational and entertainment features only.",
      "We do not promise accuracy, availability, profitability, or uninterrupted service.",
      "You remain responsible for your own decisions, including any reliance on picks, odds, or user-generated content.",
    ],
  },
  {
    title: "Changes and limits",
    items: [
      "We may update, suspend, or remove features, content, or policies as the product evolves.",
      "We may set eligibility, content, and account rules that are reasonably necessary for safety, operations, or legal compliance.",
      "These terms should be reviewed with counsel before production launch in any specific jurisdiction.",
    ],
  },
];

function Terms() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <SeoHead
        title="Terms of Use"
        description="Read the yolofootball terms of use, including acceptable use, user conduct, and the limits of picks and prediction content."
        path="/terms"
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
            <p className={styles.eyebrow}>Terms of Use</p>
            <h1 className={styles.title}>Rules for using yolofootball responsibly.</h1>
            <p className={styles.description}>
              These terms explain the basic rules for account use, community participation, and
              how to interpret picks, predictions, and product content.
            </p>
            <div className={styles.heroTags}>
              <span>Account and conduct rules</span>
              <span>No guarantee of outcomes</span>
            </div>
          </div>

          <article className={styles.summaryCard}>
            <p className={styles.cardEyebrow}>Quick read</p>
            <h2>What matters most</h2>
            <ul className={styles.summaryList}>
              <li>Use your account honestly and keep your credentials secure.</li>
              <li>Do not misuse community features or interfere with the service.</li>
              <li>Picks, predictions, and custom odds are not guarantees or financial advice.</li>
            </ul>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Current terms</p>
            <h2>Core usage expectations</h2>
          </div>
          <div className={styles.policyGrid}>
            {sections.map((section) => (
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
      </main>

      <div className={styles.footer}>
        <h5>&reg;{currentYear} Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default Terms;
