import styles from "./Home.module.css";
import HomeLogo from "../HomeLogo";
import Head from "next/head";
import HomeMenu from "../HomeMenu";
import LeagueMenu from "../LeagueMenu";
import GameEntry from "../GameEntry";
import HomeReceipt from "../HomeReceipt";
import { useEffect, useState, useContext } from "react";
import AppContext from "../../helper/AppContext";

function Home() {
  const [entries, setEntries] = useState([]);
  const { appContext, setAppContext } = useContext(AppContext);
  const showMobileOrder = appContext.showMobileOrder;
  // getting current league fixture data
  useEffect(() => {
    fetch("https://service.yolofootball.com/api/data/prepareData", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        let entryData = Object.values(data);
        entryData = entryData.filter(
          (item) => new Date(item.fixture?.date) >= new Date()
        );
        setEntries(Object.values(entryData));
      })
      .catch((error) => console.log(error));
  }, []);

  const entryComponent =
    entries?.length > 0 ? (
      entries?.map((item) => {
        return (
          <GameEntry
            id={item.fixture?.id}
            home={item.teams?.home?.name}
            away={item.teams?.away?.name}
            odd={item.odds}
            fixture={item.fixture}
            league={item.league}
          ></GameEntry>
        );
      })
    ) : (
      <h5>No events found</h5>
    );

  return (
    <>
      <Head>
        <title>yolofootball</title>
        <meta
          name="description"
          content="yolofootball home page, here to start your amazing football betting journey"
        />
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
        <div className={styles.games}>
          {showMobileOrder && <HomeReceipt isMobile={true} />}
          {entryComponent}
        </div>
        <HomeReceipt />
      </div>
      <div className={styles.footer}>
        <h5>®2023 Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default Home;
