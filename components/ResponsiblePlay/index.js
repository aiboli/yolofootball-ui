import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import SeoHead from "../SeoHead";
import SiteFooter from "../SiteFooter";
import styles from "../Privacy/Privacy.module.css";

const sections = [
  {
    title: "Entertainment-first mindset",
    items: [
      "Treat picks, predictions, and matchday activity as entertainment, not guaranteed income or financial planning.",
      "Set personal limits for time, attention, and money before you engage with betting-like features.",
      "Step away when the product stops feeling fun, controlled, or optional.",
    ],
  },
  {
    title: "Protective habits",
    items: [
      "Do not chase losses or increase stakes simply because a prior outcome disappointed you.",
      "Do not use the service when tired, distressed, impaired, or under emotional pressure.",
      "Take regular breaks and review your activity with a clear head.",
    ],
  },
  {
    title: "Age and suitability",
    items: [
      "Do not use age-restricted or wagering-like features if you are under the legal age in your location.",
      "If wagering-related products are not appropriate or lawful where you are, do not use them.",
      "Product availability may change by jurisdiction, feature set, or future compliance decisions.",
    ],
  },
  {
    title: "If you need help",
    items: [
      "If you think gaming or betting behavior is becoming difficult to control, stop using the product and seek support promptly.",
      "Production launch should include region-appropriate support contacts and self-exclusion or cooling-off options where relevant.",
      "This page is a product safety notice, not a substitute for jurisdiction-specific legal or clinical advice.",
    ],
  },
];

function ResponsiblePlay() {
  return (
    <>
      <SeoHead
        title="Responsible Play"
        description="Read the yolofootball responsible play guidance for healthier, lower-risk engagement with picks, predictions, and wagering-like features."
        path="/responsible-play"
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
            <p className={styles.eyebrow}>Responsible Play</p>
            <h1 className={styles.title}>Keep matchday activity controlled, informed, and optional.</h1>
            <p className={styles.description}>
              As yolofootball grows beyond a simple slip, responsible play guidance should stay
              visible. This page sets a product-level expectation for safer behavior and clearer
              decision-making.
            </p>
            <div className={styles.heroTags}>
              <span>Entertainment, not income</span>
              <span>Know your limits</span>
            </div>
          </div>

          <article className={styles.summaryCard}>
            <p className={styles.cardEyebrow}>Quick read</p>
            <h2>Safer defaults</h2>
            <ul className={styles.summaryList}>
              <li>Use the product only when you can stay calm and in control.</li>
              <li>Never chase losses or treat predictions as certainty.</li>
              <li>Walk away early if the experience stops feeling healthy.</li>
            </ul>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Responsible habits</p>
            <h2>Guidance for safer engagement</h2>
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

      <SiteFooter />
    </>
  );
}

export default ResponsiblePlay;
