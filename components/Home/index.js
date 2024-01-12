import styles from "./Home.module.css";
import HomeLogo from "../HomeLogo";
import Head from "next/head";
import HomeMenu from "../HomeMenu";
import LeagueMenu from "../LeagueMenu";
import GameEntry from "../GameEntry";
import HomeReceipt from "../HomeReceipt";

function Home() {
  let entries = [
    {
      home: "Manchester City",
      away: "Manchester United",
      id: "111111",
      odd: {
        home: "1.78",
        draw: "2.50",
        away: "3.50",
      },
    },
    {
      home: "Newcastle United",
      away: "Chelsea",
      id: "111112",
      odd: {
        home: "2.10",
        draw: "2.40",
        away: "2.78",
      },
    },
    {
      home: "Arsenal",
      away: "Everton",
      id: "111113",
      odd: {
        home: "1.50",
        draw: "2.70",
        away: "4.50",
      },
    },
    {
      home: "Liverpool",
      away: "Stock City",
      id: "111114",
      odd: {
        home: "1.10",
        draw: "3.70",
        away: "5.50",
      },
    },
    {
      home: "Cystal Palace",
      away: "Totteham Hotspur",
      id: "111115",
      odd: {
        home: "4.88",
        draw: "2.80",
        away: "1.30",
      },
    },
  ];

  const entryComponent = entries.map((item) => {
    return (
      <GameEntry id={item.id} home={item.home} away={item.away} odd={item.odd}></GameEntry>
    );
  });

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
        <div className={styles.games}>{entryComponent}</div>
        <HomeReceipt />
      </div>
      <div className={styles.footer}>
        <h5>®2023 Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default Home;
