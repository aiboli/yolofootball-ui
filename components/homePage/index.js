import styles from "./HomePage.module.css";
import HomeLogo from "../HomeLogo";
import Head from "next/head";
import HomeMenu from "../HomeMenu";
import LeagueMenu from "../LeagueMenu";

function HomePage() {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto"
          rel="stylesheet"
        />
      </Head>
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <HomeLogo />
          <HomeMenu />
        </nav>
      </div>
      <div className={styles.content}>
        <LeagueMenu />
        <div className={styles.games}>center dashboard</div>
        <div className={styles.dashboard}>right section</div>
      </div>
      <div className={styles.footer}>footer</div>
    </>
  );
}

export default HomePage;
