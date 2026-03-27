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
import { getCookie } from "../../helper/cookieHelper";

function Home() {
  const [entries, setEntries] = useState([]);
  const [customOddsByFixture, setCustomOddsByFixture] = useState({});
  const [loading, setLoading] = useState(true);
  const { appContext, setAppContext } = useContext(AppContext);
  const showMobileOrder = appContext.showMobileOrder;

  async function loadCustomOdds(entryList = entries) {
    const fixtureIds = entryList
      .map((item) => item.fixture?.id)
      .filter((fixtureId) => Number.isInteger(fixtureId));

    if (fixtureIds.length === 0) {
      setCustomOddsByFixture({});
      return;
    }

    try {
      const accessToken = getCookie("access_token");
      const response = await fetch("https://service.yolofootball.com/api/events/search", {
        method: "POST",
        body: JSON.stringify({
          fixture_ids: fixtureIds,
          status: "active",
        }),
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { authorization: `${accessToken}` } : {}),
        },
      });
      const data = await response.json();

      if (response.ok) {
        setCustomOddsByFixture(data.events_by_fixture || {});
      }
    } catch (error) {
      console.error("Failed to load custom odds", error);
    }
  }

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
          loadCustomOdds(entryData).catch((error) => {
            console.error("Failed to load custom odds", error);
          });
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

  useEffect(() => {
    if (entries.length === 0) {
      return;
    }

    loadCustomOdds(entries).catch((error) => {
      console.error("Failed to refresh custom odds", error);
    });
  }, [appContext.userProfile?.userName]);

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
          customEvents={customOddsByFixture[String(item.fixture?.id)] || []}
          canCreateCustomOdds={!!appContext.userProfile?.userName}
          onCustomOddsCreated={() => loadCustomOdds(entries)}
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
