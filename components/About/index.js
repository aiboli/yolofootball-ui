import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import SeoHead from "../SeoHead";
import styles from "./About.module.css";

const liveCapabilities = [
  {
    title: "Fast matchday picks",
    description:
      "Browse fixtures, compare 1X2 outcomes, and build a cleaner bet basket without getting buried in sportsbook noise.",
  },
  {
    title: "Community custom odds",
    description:
      "Post your own 1X2 prices before kickoff, manage your live custom odd, and explore what other users are publishing around the same fixture.",
  },
  {
    title: "Mobile-first flow",
    description:
      "Home, account, slip, and fixture actions keep the same visual language so the product feels fast, familiar, and easy to learn on small screens.",
  },
  {
    title: "Clearer match context",
    description:
      "League badges, kickoff timing, and grouped actions keep the focus on what matters now: the fixture, the odds, and the decision in front of you.",
  },
];

const experiencePillars = [
  {
    title: "For casual football fans",
    description:
      "The goal is not to overwhelm people with a giant sportsbook. It is to make football interaction easier to understand, quicker to join, and more fun to revisit.",
  },
  {
    title: "Built to grow beyond the slip",
    description:
      "yolofootball started as a betting slip MVP, but the product direction is expanding into a broader football experience built around content, predictions, social proof, and repeat engagement.",
  },
  {
    title: "Designed around return visits",
    description:
      "The long-term product is meant to feel alive every day, with fresh match highlights, guided actions, and reasons to come back even before a user places a real order.",
  },
];

const roadmap = [
  {
    phase: "Phase 1",
    title: "Content and discovery first",
    description:
      "The homepage is moving toward a mixed content and fixture feed so first-time visitors immediately understand what is worth watching and why it matters today.",
    items: [
      "Today focus cards and hot matches",
      "Beginner-friendly betting explainers",
      "League and team follow entry points",
      "Shareable match, pick, and record cards",
    ],
  },
  {
    phase: "Phase 2",
    title: "Low-pressure interaction",
    description:
      "The next layer is participation without friction, giving users ways to join football conversations and prediction flows before they ever commit to a real wager.",
    items: [
      "Free prediction mode and streak challenges",
      "Task-based onboarding after signup",
      "Leaderboards for accuracy and creators",
      "A notification center for matches and outcomes",
    ],
  },
  {
    phase: "Phase 3",
    title: "Community and momentum",
    description:
      "Once the audience layer is stronger, the product can lean into creator identity, follow relationships, and social signals around the most interesting picks.",
    items: [
      "Creator profiles and featured picks",
      "Follow, copy, and discover popular plays",
      "Activity around custom odds posts",
      "Campaign and referral loops for growth",
    ],
  },
  {
    phase: "Phase 4",
    title: "Smarter matchday personalization",
    description:
      "Longer term, the platform can become more adaptive and more global without losing its lightweight core.",
    items: [
      "Live match experiences and real-time prompts",
      "More markets beyond simple 1X2",
      "AI-guided recommendations by preference",
      "Localization across leagues, language, and region",
    ],
  },
];

const signalCards = [
  {
    label: "Live now",
    value: "Fixtures, slips, and custom odds",
  },
  {
    label: "Next up",
    value: "Content feed, predictions, and follows",
  },
  {
    label: "North star",
    value: "A football product fans return to daily",
  },
];

function About() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <SeoHead
        title="About"
        description="Learn how yolofootball is evolving from a simple football slip into a more social, content-led matchday experience."
        path="/about"
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
            <p className={styles.eyebrow}>About yolofootball</p>
            <h1 className={styles.title}>
              From a simpler betting slip to a richer football matchday product.
            </h1>
            <p className={styles.description}>
              yolofootball is being shaped for football fans who want more than a wall of odds.
              Today it already helps users follow fixtures, stack picks, and post custom odds.
              The next chapters push further into discovery, free interaction, social proof, and
              personalized matchday experiences that feel lighter than a traditional sportsbook.
            </p>
            <div className={styles.heroTags}>
              <span>Cleaner match flow</span>
              <span>Community custom odds</span>
              <span>Roadmap built for growth</span>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.panelGlow} aria-hidden="true"></div>
            <div className={styles.panelFrame}>
              <div className={styles.panelHeader}>
                <span className={styles.panelKickoff}>Matchday direction</span>
                <span className={styles.panelStatus}>Evolving now</span>
              </div>

              <div className={styles.signalGrid}>
                {signalCards.map((card) => (
                  <article key={card.label} className={styles.signalCard}>
                    <p>{card.label}</p>
                    <h3>{card.value}</h3>
                  </article>
                ))}
              </div>

              <div className={styles.heroPulseRow}>
                <div className={styles.heroPulseTrack}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>
                  The product direction is shifting from a transactional tool into a daily football
                  destination with more ways to watch, learn, predict, and share.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>What users can do today</p>
            <h2>Current experience</h2>
            <p>
              The live product already covers the core matchday loop while keeping the interface
              compact and recognizable.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {liveCapabilities.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <div className={styles.cardAccent} aria-hidden="true"></div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionLayered}`}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Why the product is changing</p>
            <h2>The bigger idea behind the UI</h2>
            <p>
              The long-term opportunity is not just better order placement. It is a friendlier
              football experience for lighter fans who want context, guidance, and a reason to
              return every day.
            </p>
          </div>

          <div className={styles.pillarGrid}>
            {experiencePillars.map((pillar) => (
              <article key={pillar.title} className={styles.pillarCard}>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>What comes next</p>
            <h2>Roadmap direction</h2>
            <p>
              Future work is focused on discovery, free prediction loops, creator energy, and a
              more personalized matchday home.
            </p>
          </div>

          <div className={styles.roadmap}>
            {roadmap.map((step) => (
              <article key={step.phase} className={styles.roadmapCard}>
                <div className={styles.roadmapHeader}>
                  <span>{step.phase}</span>
                  <h3>{step.title}</h3>
                </div>
                <p className={styles.roadmapDescription}>{step.description}</p>
                <ul className={styles.roadmapList}>
                  {step.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.closingBanner}>
          <div>
            <p className={styles.sectionEyebrow}>Where we are headed</p>
            <h2>A football product that teaches, invites, and rewards participation.</h2>
          </div>
          <p>
            The UI is growing with that goal in mind: keep the current experience simple, then add
            clearer entry points, stronger community signals, and future features that make
            yolofootball feel useful even before a user places a bet.
          </p>
        </section>
      </main>

      <div className={styles.footer}>
        <h5>&reg;{currentYear} Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default About;
