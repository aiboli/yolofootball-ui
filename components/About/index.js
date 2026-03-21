import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import styles from "./About.module.css";
import SeoHead from "../SeoHead";

function About() {
  return (
    <>
      <SeoHead
        title="About"
        description="Learn how yolofootball helps football fans follow fixtures, compare outcomes, and build simpler betting slips."
        path="/about"
      />
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <HomeLogo />
          <HomeMenu />
        </nav>
      </div>
      <div className={styles.content}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>About yolofootball</p>
          <h1 className={styles.title}>Football picks, one clean matchday slip.</h1>
          <p className={styles.description}>
            yolofootball is built for fans who want a lightweight, mobile-friendly
            way to follow fixtures, compare outcomes, and build a bet basket
            without the clutter of a traditional sportsbook interface.
          </p>
        </section>
        <section className={styles.grid}>
          <article className={styles.card}>
            <h3>Simple Match Selection</h3>
            <p>
              Browse live fixtures, choose the outcomes you believe in, and keep
              your selections organized in one basket that updates as you go.
            </p>
          </article>
          <article className={styles.card}>
            <h3>Built For Accumulators</h3>
            <p>
              Stack picks across multiple games, see your combined rate instantly,
              and understand your potential return before you commit your stake.
            </p>
          </article>
          <article className={styles.card}>
            <h3>Fast And Familiar</h3>
            <p>
              The interface keeps the same visual language across home, auth, and
              basket flows so the whole experience feels consistent and easy to use.
            </p>
          </article>
        </section>
      </div>
      <div className={styles.footer}>
        <h5>&reg;2023 Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default About;
