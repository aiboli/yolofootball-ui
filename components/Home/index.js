import styles from "./Home.module.css";
import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import LeagueMenu from "../LeagueMenu";
import GameEntry from "../GameEntry";
import HomeReceipt from "../HomeReceipt";
import HomeOrder from "../HomeOrder";
import { useEffect, useState, useContext } from "react";
import AppContext from "../../helper/AppContext";
import Loader from "../Loader";
import SeoHead from "../SeoHead";

function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { appContext, setAppContext } = useContext(AppContext);
  const showMobileOrder = appContext.showMobileOrder;

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      setAppContext((currentContext) => ({
        ...currentContext,
        isBusy: true,
      }));

      try {
        const response = await fetch(
          "https://service.yolofootball.com/api/data/prepareData",
          {
            method: "GET",
          }
        );
        const data = await response.json();
        const entryData = Object.values(data).filter(
          (item) => new Date(item.fixture?.date) >= new Date()
        );

        if (isMounted) {
          setEntries(entryData);
        }
      } catch (error) {
        console.error("Failed to load fixtures", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        setAppContext((currentContext) => ({
          ...currentContext,
          isBusy: false,
        }));
      }
    }

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, [setAppContext]);

  const entryComponent =
    entries?.length > 0 ? (
      entries.map((item) => (
        <GameEntry
          key={item.fixture?.id}
          id={item.fixture?.id}
          home={item.teams?.home?.name}
          away={item.teams?.away?.name}
          odd={item.odds}
          fixture={item.fixture}
          league={item.league}
        />
      ))
    ) : (
      <h5>No events found</h5>
    );

  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "yolofootball",
      url: "https://www.yolofootball.com",
      logo: "https://www.yolofootball.com/assets/logo/logo.png",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "yolofootball",
      url: "https://www.yolofootball.com",
      description:
        "Football betting slip app for browsing fixtures, selecting picks, and tracking accumulator odds.",
    },
  ];

  return (
    <>
      <SeoHead
        title="Football betting slips and accumulator picks"
        description="Browse football fixtures, build a bet basket, compare accumulator odds, and manage your selections in yolofootball."
        path="/"
        schema={homeSchema}
      />
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <HomeLogo />
          <HomeMenu />
        </nav>
      </div>
      <div className={styles.content}>
        <LeagueMenu />
        <div className={styles.games}>
          <section className={styles.seoIntro}>
            <h1 className={styles.pageTitle}>Football betting slips made simple</h1>
            <p className={styles.pageDescription}>
              yolofootball helps you browse football fixtures, pick match outcomes,
              and build accumulator-style bet baskets with a cleaner, faster
              interface.
            </p>
          </section>
          {loading && <Loader />}
          {!loading && showMobileOrder && <HomeReceipt isMobile={true} />}
          {!loading && entryComponent}
        </div>
        <div>
          <HomeReceipt />
          <HomeOrder />
        </div>
      </div>
      <div className={styles.footer}>
        <h5>&reg;2023 Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default Home;
