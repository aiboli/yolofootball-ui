import { useEffect, useState } from "react";
import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import Loader from "../Loader";
import SeoHead from "../SeoHead";
import { readJsonSafely } from "../../helper/apiResponse";
import styles from "./Insights.module.css";

const formatKickoff = (value) => {
  if (!value) {
    return "Kickoff unavailable";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatRecordTime = (value) => {
  if (!value) {
    return "Update unavailable";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function Insights() {
  const [homeFeed, setHomeFeed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeFeed() {
      try {
        let data = null;
        const response = await fetch("https://service.yolofootball.com/api/data/homeFeed", {
          method: "GET",
        });
        data = await readJsonSafely(response);

        if (!response.ok || !data || typeof data !== "object") {
          const fallbackResponse = await fetch("https://service.yolofootball.com/api/data/prepareData", {
            method: "GET",
          });
          const fallbackData = await readJsonSafely(fallbackResponse);
          if (fallbackResponse.ok && fallbackData && typeof fallbackData === "object") {
            data = {
              fixtures: Object.values(fallbackData),
            };
          }
        }

        if (isMounted) {
          setHomeFeed(data);
        }
      } catch (error) {
        console.error("Failed to load insights feed", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHomeFeed();

    return () => {
      isMounted = false;
    };
  }, []);

  const sportsdb = homeFeed?.sportsdb || null;
  const spotlightTeams = Array.isArray(sportsdb?.spotlight_teams) ? sportsdb.spotlight_teams : [];
  const tableSnapshot = Array.isArray(sportsdb?.table_snapshot) ? sportsdb.table_snapshot : [];
  const beginnerGuides = Array.isArray(homeFeed?.beginner_guides) ? homeFeed.beginner_guides : [];
  const contentCards = Array.isArray(homeFeed?.content_cards) ? homeFeed.content_cards : [];

  return (
    <>
      <SeoHead
        title="Insights"
        description="Browse matchday context, beginner guides, club watch cards, and editorial football insights on yolofootball."
        path="/insights"
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
            <p className={styles.eyebrow}>Matchday context</p>
            <h1>Insights, explainers, and club signals without crowding the homepage.</h1>
            <p>
              This page holds the deeper context layer for yolofootball: club watch cards, EPL
              table snapshots, beginner guides, and editorial notes that help casual fans
              understand what matters before they head back to the fixture board.
            </p>
            <div className={styles.heroActions}>
              <a href="/" className={styles.primaryAction}>
                Back to fixtures
              </a>
              <a href="/about" className={styles.secondaryAction}>
                Product direction
              </a>
            </div>
          </div>
          <article className={styles.heroPanel}>
            <p className={styles.cardEyebrow}>What lives here</p>
            <div className={styles.signalList}>
              <div className={styles.signalItem}>
                <strong>Club watch</strong>
                <p>Short team context around today&apos;s spotlight fixture.</p>
              </div>
              <div className={styles.signalItem}>
                <strong>Beginner guides</strong>
                <p>Entry points for lighter fans who want to understand the product faster.</p>
              </div>
              <div className={styles.signalItem}>
                <strong>Editorial cards</strong>
                <p>Simple product and matchday framing that no longer needs to sit on Home.</p>
              </div>
            </div>
          </article>
        </section>

        {loading ? (
          <div className={styles.loaderWrap}>
            <Loader />
          </div>
        ) : (
          <>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.cardEyebrow}>Club watch</p>
                  <h2>Spotlight clubs and a quick EPL table read</h2>
                </div>
                <p className={styles.sectionCopy}>
                  Shared Premier League context refreshed from TheSportsDB so matchday browsing can
                  stay lightweight while deeper context lives here.
                </p>
              </div>
              <div className={styles.clubWatchGrid}>
                <div className={styles.clubWatchCards}>
                  {spotlightTeams.length > 0 ? (
                    spotlightTeams.map((team) => (
                      <article
                        key={`${team.fixture_id}-${team.side}`}
                        className={styles.clubWatchCard}
                        style={{
                          "--club-accent": team.team_colors?.[0] || "#fecb7a",
                        }}
                      >
                        <div className={styles.clubWatchHeader}>
                          <div className={styles.clubWatchIdentity}>
                            {team.team_badge ? (
                              <img src={team.team_badge} alt={team.team_name} className={styles.clubBadge} />
                            ) : (
                              <div className={styles.clubBadgeFallback} aria-hidden="true"></div>
                            )}
                            <div>
                              <p className={styles.cardEyebrow}>
                                {team.side === "home" ? "Home club" : "Away club"}
                              </p>
                              <h3>{team.team_name}</h3>
                            </div>
                          </div>
                          {team.table?.rank && (
                            <span className={styles.rankPill}>EPL #{team.table.rank}</span>
                          )}
                        </div>
                        <p className={styles.clubMeta}>
                          {team.location || "Location unavailable"}
                          {team.stadium ? ` | ${team.stadium}` : ""}
                        </p>
                        {team.description_excerpt && (
                          <p className={styles.clubDescription}>{team.description_excerpt}</p>
                        )}
                        {team.keywords?.length > 0 && (
                          <div className={styles.keywordList}>
                            {team.keywords.slice(0, 4).map((keyword) => (
                              <span key={`${team.team_name}-${keyword}`} className={styles.keywordChip}>
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className={styles.clubStatsRow}>
                          <span>Points: {team.table?.points ?? "-"}</span>
                          <span>Played: {team.table?.played ?? "-"}</span>
                          <span>GD: {team.table?.goal_difference ?? "-"}</span>
                          <span>Form: {team.table?.form || "-"}</span>
                        </div>
                        <div className={styles.eventPair}>
                          <article className={styles.eventMiniCard}>
                            <p className={styles.cardEyebrow}>Last match</p>
                            {team.last_event ? (
                              <>
                                <h4>{team.last_event.event_name}</h4>
                                <p>{formatKickoff(team.last_event.timestamp || team.last_event.date)}</p>
                                <p>
                                  {team.last_event.home_score ?? "-"} - {team.last_event.away_score ?? "-"} |{" "}
                                  {team.last_event.status || "Status unavailable"}
                                </p>
                              </>
                            ) : (
                              <p>No recent match available.</p>
                            )}
                          </article>
                          <article className={styles.eventMiniCard}>
                            <p className={styles.cardEyebrow}>Next match</p>
                            {team.next_event ? (
                              <>
                                <h4>{team.next_event.event_name}</h4>
                                <p>{formatKickoff(team.next_event.timestamp || team.next_event.date)}</p>
                                <p>{team.next_event.status || "Kickoff pending"}</p>
                              </>
                            ) : (
                              <p>No upcoming match available.</p>
                            )}
                          </article>
                        </div>
                      </article>
                    ))
                  ) : (
                    <article className={styles.clubWatchEmpty}>
                      <p className={styles.cardEyebrow}>Club watch</p>
                      <h3>Club details are temporarily unavailable</h3>
                      <p>
                        The fixture board is still live. We just do not have the latest enrichment
                        for the current spotlight fixture yet.
                      </p>
                    </article>
                  )}
                </div>
                <article className={styles.tableSnapshotCard}>
                  <div className={styles.tableSnapshotHeader}>
                    <div>
                      <p className={styles.cardEyebrow}>Table snapshot</p>
                      <h3>Current EPL top five</h3>
                    </div>
                    <span className={styles.tableStatus}>
                      {sportsdb?.status === "healthy"
                        ? "Healthy"
                        : sportsdb?.status === "partial"
                          ? "Partial"
                          : "Unavailable"}
                    </span>
                  </div>
                  <p className={styles.cardMeta}>Cached {formatRecordTime(sportsdb?.cached_at)}</p>
                  {tableSnapshot.length > 0 ? (
                    <div className={styles.tableList}>
                      {tableSnapshot.map((team) => (
                        <div
                          key={`${team.team_id_api_football || team.team_name}-${team.rank}`}
                          className={styles.tableRow}
                        >
                          <div className={styles.tableTeam}>
                            {team.team_badge ? (
                              <img src={team.team_badge} alt={team.team_name} className={styles.tableBadge} />
                            ) : (
                              <div className={styles.tableBadgeFallback} aria-hidden="true"></div>
                            )}
                            <div>
                              <strong>
                                #{team.rank} {team.team_name}
                              </strong>
                              <p>{team.note || "League position update"}</p>
                            </div>
                          </div>
                          <div className={styles.tableMetrics}>
                            <span>{team.points} pts</span>
                            <span>{team.played} played</span>
                            <span>GD {team.goal_difference}</span>
                            <span>{team.form || "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.tableEmptyState}>
                      Table data is not available right now, but the fixture feed is still ready to browse.
                    </p>
                  )}
                </article>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.cardEyebrow}>Beginner guides</p>
                  <h2>Learn the flow before you place a real order</h2>
                </div>
                <p className={styles.sectionCopy}>
                  These quick cards explain the lightest way into the product for users who need a
                  bit more context than the homepage should carry.
                </p>
              </div>
              <div className={styles.guideGrid}>
                {beginnerGuides.length > 0 ? (
                  beginnerGuides.map((guide) => (
                    <article className={styles.guideCard} key={guide.id}>
                      <p className={styles.cardEyebrow}>Guide</p>
                      <h3>{guide.title}</h3>
                      <p>{guide.description}</p>
                      <span className={styles.guideCta}>{guide.cta_label}</span>
                    </article>
                  ))
                ) : (
                  <article className={styles.emptyCard}>
                    <h3>Guides are coming soon</h3>
                    <p>The fixture board is live, but the current guide set is not available yet.</p>
                  </article>
                )}
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.cardEyebrow}>Editorial notes</p>
                  <h2>Short product and matchday framing cards</h2>
                </div>
                <p className={styles.sectionCopy}>
                  These cards keep the tone and onboarding context accessible without crowding the
                  main fixture board.
                </p>
              </div>
              <div className={styles.insightGrid}>
                {contentCards.length > 0 ? (
                  contentCards.map((item) => (
                    <article className={styles.insightCard} key={item.id}>
                      <p className={styles.cardEyebrow}>{item.eyebrow}</p>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </article>
                  ))
                ) : (
                  <article className={styles.emptyCard}>
                    <h3>No editorial cards available right now</h3>
                    <p>Come back later for more matchday context and lightweight explainers.</p>
                  </article>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <div className={styles.footer}>
        <h5>&reg;2023 Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default Insights;
