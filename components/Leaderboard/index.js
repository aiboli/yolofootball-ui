import { useEffect, useState } from "react";
import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import Loader from "../Loader";
import SeoHead from "../SeoHead";
import SiteFooter from "../SiteFooter";
import { getCookie } from "../../helper/cookieHelper";
import { readJsonSafely } from "../../helper/apiResponse";
import styles from "./Leaderboard.module.css";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [hotThisWeek, setHotThisWeek] = useState([]);
  const [viewerEntry, setViewerEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLeaderboard() {
      setIsLoading(true);

      try {
        const accessToken = getCookie("access_token");
        const response = await fetch(
          "https://service.yolofootball.com/api/predictions/leaderboard",
          {
            method: "GET",
            headers: {
              ...(accessToken ? { Authorization: accessToken } : {}),
            },
          }
        );
        const data = await readJsonSafely(response);
        if (!response.ok || !isMounted) {
          return;
        }

        setLeaderboard(Array.isArray(data?.leaderboard) ? data.leaderboard : []);
        setHotThisWeek(Array.isArray(data?.hotThisWeek) ? data.hotThisWeek : []);
        setViewerEntry(data?.viewerEntry || null);
      } catch (error) {
        console.error("Failed to load leaderboard", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <SeoHead
        title="Prediction Leaderboard"
        description="Track prediction accuracy, current streaks, and weekly hot players on the yolofootball leaderboard."
        path="/leaderboard"
      />
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <HomeLogo />
          <HomeMenu />
        </nav>
      </div>
      <main className={styles.content}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Prediction leaderboard</p>
            <h1>Accuracy, streaks, and weekly momentum in one place.</h1>
            <p className={styles.heroCopy}>
              Free prediction now has a visible scorecard. Track who is calling results well, who
              is hottest this week, and where your own form currently stands.
            </p>
          </div>
          {viewerEntry && (
            <article className={styles.viewerCard}>
              <p className={styles.cardEyebrow}>Your standing</p>
              <h3>{viewerEntry.userName}</h3>
              <div className={styles.viewerStats}>
                <span>
                  {viewerEntry.rank ? `#${viewerEntry.rank}` : "Unranked"}
                </span>
                <span>{viewerEntry.predictionSummary.accuracy}% accuracy</span>
                <span>{viewerEntry.predictionSummary.currentStreak}W current streak</span>
              </div>
            </article>
          )}
        </section>

        {isLoading ? (
          <div className={styles.loaderWrap}>
            <Loader />
          </div>
        ) : (
          <section className={styles.boardGrid}>
            <article className={styles.boardCard}>
              <div className={styles.boardHeader}>
                <div>
                  <p className={styles.cardEyebrow}>Top accuracy</p>
                  <h2>Main board</h2>
                </div>
              </div>
              {leaderboard.length > 0 ? (
                <div className={styles.entryList}>
                  {leaderboard.map((entry) => (
                    <div key={`${entry.userName}-${entry.rank}`} className={styles.entryItem}>
                      <div>
                        <strong>
                          #{entry.rank} {entry.userName}
                        </strong>
                        <p>
                          {entry.predictionSummary.settledPredictions} settled |{" "}
                          {entry.predictionSummary.wins} wins | best streak{" "}
                          {entry.predictionSummary.bestStreak}W
                        </p>
                      </div>
                      <div className={styles.entryMetrics}>
                        <span>{entry.predictionSummary.accuracy}%</span>
                        <span>{entry.predictionSummary.currentStreak}W now</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>
                  The board will populate as settled free predictions accumulate.
                </p>
              )}
            </article>

            <article className={styles.boardCard}>
              <div className={styles.boardHeader}>
                <div>
                  <p className={styles.cardEyebrow}>Hot this week</p>
                  <h2>Weekly momentum</h2>
                </div>
              </div>
              {hotThisWeek.length > 0 ? (
                <div className={styles.entryList}>
                  {hotThisWeek.map((entry) => (
                    <div key={`hot-${entry.userName}-${entry.rank}`} className={styles.entryItem}>
                      <div>
                        <strong>
                          #{entry.rank} {entry.userName}
                        </strong>
                        <p>
                          {entry.predictionSummary.weeklyWins} weekly wins |{" "}
                          {entry.predictionSummary.weeklySettledPredictions} settled
                        </p>
                      </div>
                      <div className={styles.entryMetrics}>
                        <span>{entry.predictionSummary.weeklyAccuracy}%</span>
                        <span>{entry.predictionSummary.currentStreak}W streak</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>
                  Weekly momentum appears after the first few settled predictions each week.
                </p>
              )}
            </article>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export default Leaderboard;
