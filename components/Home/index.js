import styles from "./Home.module.css";
import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import LeagueMenu from "../LeagueMenu";
import GameEntry from "../GameEntry";
import HomeReceipt from "../HomeReceipt";
import HomeOrder from "../HomeOrder";
import NotificationsPanel from "../NotificationsPanel";
import { useEffect, useMemo, useState, useContext } from "react";
import AppContext from "../../helper/AppContext";
import Loader from "../Loader";
import SeoHead from "../SeoHead";
import { getCookie } from "../../helper/cookieHelper";
import { calculateCombinedOdd, calculatePotentialWin } from "../../helper/betHelpers";
import { readJsonSafely } from "../../helper/apiResponse";
import normalizeUserProfile from "../../helper/normalizeUserProfile";
import {
  getDefaultHomePreferences,
  readHomePreferences,
  saveHomePreferences,
  togglePreference,
} from "../../helper/homePreferences";

const scoreFixtureAgainstPreferences = (fixture, preferences) => {
  if (!fixture) {
    return 0;
  }

  const favoriteTeams = preferences?.favoriteTeams || [];
  const favoriteLeagues = preferences?.favoriteLeagues || [];
  let score = 0;

  if (favoriteLeagues.includes(fixture?.league?.name)) {
    score += 3;
  }
  if (favoriteTeams.includes(fixture?.teams?.home?.name)) {
    score += 2;
  }
  if (favoriteTeams.includes(fixture?.teams?.away?.name)) {
    score += 2;
  }

  return score;
};

const sortFixturesForHome = (fixtures, preferences) => {
  return [...fixtures].sort((left, right) => {
    const preferenceDelta =
      scoreFixtureAgainstPreferences(right, preferences) -
      scoreFixtureAgainstPreferences(left, preferences);

    if (preferenceDelta !== 0) {
      return preferenceDelta;
    }

    return new Date(left?.fixture?.date || 0).getTime() - new Date(right?.fixture?.date || 0).getTime();
  });
};

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

const getStepCompletionMap = ({ userProfile, preferences, selectedEvents }) => ({
  signup: userProfile?.onboardingState?.signup_completed ?? !!userProfile?.userName,
  follow:
    userProfile?.onboardingState?.preferences_completed ??
    (preferences?.favoriteTeams?.length || 0) + (preferences?.favoriteLeagues?.length || 0) > 0,
  "starter-slip":
    userProfile?.onboardingState?.starter_slip_loaded ??
    (Array.isArray(selectedEvents) && selectedEvents.length > 0),
});

function Home() {
  const [entries, setEntries] = useState([]);
  const [homeFeed, setHomeFeed] = useState(null);
  const [customOddsByFixture, setCustomOddsByFixture] = useState({});
  const [ownCustomOddsByFixture, setOwnCustomOddsByFixture] = useState({});
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(getDefaultHomePreferences());
  const [shareFeedback, setShareFeedback] = useState("");
  const [predictionFeedback, setPredictionFeedback] = useState("");
  const [isSubmittingPrediction, setIsSubmittingPrediction] = useState(false);
  const { appContext, setAppContext, markNotificationRead } = useContext(AppContext);
  const showMobileOrder = appContext.showMobileOrder;

  async function loadCustomOdds(entryList = entries) {
    const fixtureIds = entryList
      .map((item) => item.fixture?.id)
      .filter((fixtureId) => Number.isInteger(fixtureId));

    if (fixtureIds.length === 0) {
      setCustomOddsByFixture({});
      setOwnCustomOddsByFixture({});
      return;
    }

    try {
      const accessToken = getCookie("access_token");
      const response = await fetch("https://service.yolofootball.com/api/events/search", {
        method: "POST",
        body: JSON.stringify({
          fixture_ids: fixtureIds,
          status: "active",
          include_user_context: true,
        }),
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { authorization: `${accessToken}` } : {}),
        },
      });
      const data = await readJsonSafely(response);

      if (response.ok) {
        setCustomOddsByFixture(data?.events_by_fixture || {});
        setOwnCustomOddsByFixture(data?.own_events_by_fixture || {});
      }
    } catch (error) {
      console.error("Failed to load custom odds", error);
    }
  }

  useEffect(() => {
    setPreferences(readHomePreferences());
  }, []);

  useEffect(() => {
    if (!appContext.userProfile?.userName) {
      return;
    }

    setPreferences({
      favoriteTeams: Array.isArray(appContext.userProfile.favoriteTeams)
        ? appContext.userProfile.favoriteTeams
        : [],
      favoriteLeagues: Array.isArray(appContext.userProfile.favoriteLeagues)
        ? appContext.userProfile.favoriteLeagues
        : [],
    });
  }, [appContext.userProfile?.userName, appContext.userProfile?.favoriteTeams, appContext.userProfile?.favoriteLeagues]);

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      setAppContext((currentContext) => ({
        ...currentContext,
        isBusy: true,
      }));

      try {
        let data = null;
        const response = await fetch("https://service.yolofootball.com/api/data/homeFeed", {
          method: "GET",
        });
        data = await readJsonSafely(response);

        if (!response.ok || !Array.isArray(data?.fixtures)) {
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

        const entryData = Array.isArray(data?.fixtures)
          ? data.fixtures.filter((item) => new Date(item.fixture?.date) >= new Date())
          : [];

        if (isMounted) {
          setHomeFeed(data);
          setEntries(entryData);
          loadCustomOdds(entryData).catch((error) => {
            console.error("Failed to load custom odds", error);
          });
        }
      } catch (error) {
        console.error("Failed to load home feed", error);
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

  const sortedEntries = useMemo(
    () => sortFixturesForHome(entries, preferences),
    [entries, preferences]
  );

  const stepCompletionMap = getStepCompletionMap({
    userProfile: appContext.userProfile,
    preferences,
    selectedEvents: appContext.selectedEvents,
  });

  const activeCustomOddCount = Object.values(customOddsByFixture).reduce(
    (count, currentList) => count + (Array.isArray(currentList) ? currentList.length : 0),
    0
  );
  const sportsdb = homeFeed?.sportsdb || null;
  const spotlightTeams = Array.isArray(sportsdb?.spotlight_teams) ? sportsdb.spotlight_teams : [];
  const tableSnapshot = Array.isArray(sportsdb?.table_snapshot) ? sportsdb.table_snapshot : [];

  const updatePreferences = (nextPreferences) => {
    setPreferences(nextPreferences);
    saveHomePreferences(nextPreferences);
  };

  const syncProfileFromResponse = (data) => {
    if (data?.message !== "succeed" || !data?.userProfile) {
      return;
    }

    setAppContext((currentContext) => ({
      ...currentContext,
      userProfile: normalizeUserProfile(data.userProfile),
    }));
  };

  const refreshUserProfile = async () => {
    const accessToken = getCookie("access_token");
    if (!accessToken) {
      return;
    }

    const response = await fetch("https://service.yolofootball.com/api/users/profile", {
      method: "GET",
      headers: {
        Authorization: accessToken,
      },
    });
    const data = await readJsonSafely(response);
    if (response.ok) {
      syncProfileFromResponse(data);
    }
  };

  const persistPreferences = async (nextPreferences) => {
    updatePreferences(nextPreferences);

    const accessToken = getCookie("access_token");
    if (!accessToken || !appContext.userProfile?.userName) {
      return;
    }

    try {
      const response = await fetch("https://service.yolofootball.com/api/users/preferences", {
        method: "PUT",
        body: JSON.stringify({
          favorite_teams: nextPreferences.favoriteTeams,
          favorite_leagues: nextPreferences.favoriteLeagues,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      });
      const data = await readJsonSafely(response);
      if (response.ok) {
        syncProfileFromResponse(data);
      }
    } catch (error) {
      console.error("Failed to save preferences", error);
    }
  };

  const markOnboardingStep = async (nextOnboardingState) => {
    const accessToken = getCookie("access_token");
    if (!accessToken || !appContext.userProfile?.userName) {
      return;
    }

    try {
      const response = await fetch("https://service.yolofootball.com/api/users/onboarding", {
        method: "PUT",
        body: JSON.stringify(nextOnboardingState),
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      });
      const data = await readJsonSafely(response);
      if (response.ok) {
        syncProfileFromResponse(data);
      }
    } catch (error) {
      console.error("Failed to update onboarding state", error);
    }
  };

  const handleToggleTeam = (teamName) => {
    persistPreferences({
      ...preferences,
      favoriteTeams: togglePreference(preferences.favoriteTeams, teamName),
    });
  };

  const handleToggleLeague = (leagueName) => {
    persistPreferences({
      ...preferences,
      favoriteLeagues: togglePreference(preferences.favoriteLeagues, leagueName),
    });
  };

  const applyStarterSlip = () => {
    const starterSelections = homeFeed?.starter_slip?.selections;
    if (!Array.isArray(starterSelections) || starterSelections.length === 0) {
      return;
    }

    const nextSelections = starterSelections.map((selection) => ({
      eventId: selection.fixture_id,
      optionId: `${selection.fixture_id}-${selection.selection}`,
      title: selection.selection,
      odd: selection.odd_rate,
      gameTitle: `${selection.home_team} vs ${selection.away_team}`,
    }));

    setAppContext((currentContext) => ({
      ...currentContext,
      selectedEvents: nextSelections,
      order: {
        ...currentContext.order,
        combinedOdd: calculateCombinedOdd(nextSelections),
        totalWin: calculatePotentialWin(currentContext.order.totalBet, nextSelections),
      },
    }));
    setShareFeedback("Starter slip loaded into your basket.");
    markOnboardingStep({
      starter_slip_loaded: true,
    }).catch(() => {});
  };

  const spotlightPrediction = appContext.userProfile?.recentPredictions?.find(
    (prediction) => prediction.fixtureId === homeFeed?.spotlight?.fixture_id
  );

  const submitFreePrediction = async (predictedResult, predictedLabel) => {
    const spotlightFixtureId = homeFeed?.spotlight?.fixture_id;
    if (!spotlightFixtureId) {
      return;
    }

    const accessToken = getCookie("access_token");
    if (!accessToken) {
      window.location.href = "/signup";
      return;
    }

    setIsSubmittingPrediction(true);
    setPredictionFeedback("");

    try {
      const response = await fetch("https://service.yolofootball.com/api/predictions", {
        method: "POST",
        body: JSON.stringify({
          fixture_id: spotlightFixtureId,
          predicted_result: predictedResult,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      });
      const data = await readJsonSafely(response);
      if (!response.ok) {
        setPredictionFeedback("Unable to save your prediction right now.");
        return;
      }

      await refreshUserProfile();
      setPredictionFeedback(
        `Free prediction saved: ${predictedLabel} for ${homeFeed?.spotlight?.title}.`
      );
    } catch (error) {
      setPredictionFeedback("Unable to save your prediction right now.");
    } finally {
      setIsSubmittingPrediction(false);
    }
  };

  const sharePage = async () => {
    const shareTitle = "Yolofootball matchday picks";
    const shareText =
      "Browse today's football fixtures, starter picks, and custom odds on yolofootball.";
    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://www.yolofootball.com/";

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareFeedback("Share link ready for your friends.");
    } catch (error) {
      setShareFeedback("Share was canceled.");
    }
  };

  const entryComponent =
    sortedEntries.length > 0 ? (
      sortedEntries.map((item) => (
        <GameEntry
          key={item.fixture?.id}
          id={item.fixture?.id}
          home={item.teams?.home?.name}
          away={item.teams?.away?.name}
          odd={item.odds}
          fixture={item.fixture}
          league={item.league}
          customEvents={customOddsByFixture[String(item.fixture?.id)] || []}
          ownCustomEvent={(ownCustomOddsByFixture[String(item.fixture?.id)] || [])[0] || null}
          canCreateCustomOdds={!!appContext.userProfile?.userName}
          onCustomOddsChanged={() => loadCustomOdds(entries)}
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
        "Browse football fixtures, follow favorite clubs, build a starter accumulator, and explore custom odds on yolofootball.",
    },
  ];

  return (
    <>
      <SeoHead
        title="Football picks, starter slips, and custom odds"
        description="Browse football fixtures, discover beginner-friendly starter slips, follow teams you care about, and explore community custom odds on yolofootball."
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
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Matchday made simple</p>
              <h1 className={styles.pageTitle}>A football homepage that teaches, guides, and lets you play</h1>
              <p className={styles.pageDescription}>
                Start with today&apos;s spotlight fixture, load an example accumulator, follow the clubs you care
                about, and then move naturally into picks, orders, and custom odds.
              </p>
              <div className={styles.heroActions}>
                <button className={styles.primaryButton} type="button" onClick={applyStarterSlip}>
                  Load starter slip
                </button>
                <button className={styles.secondaryButton} type="button" onClick={sharePage}>
                  Share matchday page
                </button>
              </div>
              {shareFeedback && <p className={styles.feedback}>{shareFeedback}</p>}
            </div>
            {homeFeed?.spotlight && (
              <article className={styles.spotlightCard}>
                <p className={styles.cardEyebrow}>Today&apos;s spotlight</p>
                <h3>{homeFeed.spotlight.title}</h3>
                <p className={styles.cardMeta}>
                  {homeFeed.spotlight.league_name} | {formatKickoff(homeFeed.spotlight.kickoff)}
                </p>
                <p>{homeFeed.spotlight.storyline}</p>
                <div className={styles.spotlightStats}>
                  <span>{homeFeed.spotlight.custom_odd_count} custom odds posts</span>
                  {homeFeed.spotlight.favorite_pick && (
                    <span>
                      Favorite: {homeFeed.spotlight.favorite_pick.label} @ {homeFeed.spotlight.favorite_pick.odd}
                    </span>
                  )}
                </div>
              </article>
            )}
          </section>

          <section className={styles.notificationPanelSection}>
            <NotificationsPanel
              title="Matchday action center"
              description={
                appContext.userProfile?.userName
                  ? "Unread alerts from your follows, predictions, orders, and custom odds appear here first."
                  : "Sign in to see kickoff reminders, prediction results, and settlement updates here."
              }
              notifications={appContext.notifications}
              emptyTitle={
                appContext.userProfile?.userName
                  ? "You are all caught up."
                  : "No alerts yet."
              }
              emptyDescription={
                appContext.userProfile?.userName
                  ? "New activity will show up here as followed fixtures approach kickoff or your actions settle."
                  : "Create an account, follow a few clubs, and your action center will start filling in."
              }
              limit={3}
              isBusy={appContext.isNotificationsBusy}
              onMarkRead={appContext.userProfile?.userName ? markNotificationRead : undefined}
            />
          </section>

          {sportsdb && (
            <section className={styles.clubWatchSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.cardEyebrow}>Club watch</p>
                  <h2>Spotlight clubs and a quick EPL table read</h2>
                </div>
                <p className={styles.sectionCopy}>
                  Shared Premier League context refreshed hourly from TheSportsDB so the homepage can
                  add club storylines without changing the core fixture board.
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
                        The matchday feed is still live. We just do not have the latest TheSportsDB
                        enrichment for the current spotlight fixture yet.
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
                      {sportsdb.status === "healthy"
                        ? "Healthy"
                        : sportsdb.status === "partial"
                          ? "Partial"
                          : "Unavailable"}
                    </span>
                  </div>
                  <p className={styles.cardMeta}>Cached {formatRecordTime(sportsdb.cached_at)}</p>
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
                      Table data is not available right now, but the fixture feed and custom odds are
                      still ready to browse.
                    </p>
                  )}
                </article>
              </div>
            </section>
          )}

          <section className={styles.insightGrid}>
            {homeFeed?.content_cards?.map((item) => (
              <article className={styles.insightCard} key={item.id}>
                <p className={styles.cardEyebrow}>{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </section>

          <section className={styles.preferencePanel} id="follow">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.cardEyebrow}>Personalize</p>
                <h2>Follow teams and leagues you want to see first</h2>
              </div>
              <p className={styles.sectionCopy}>
                Signed-in users now save follows to their account, while guests can still keep a
                lighter local version on this device.
              </p>
            </div>
            <div className={styles.preferenceColumns}>
              <div className={styles.preferenceGroup}>
                <h4>Popular teams</h4>
                <div className={styles.chipList}>
                  {(homeFeed?.follow_options?.teams || []).map((teamName) => (
                    <button
                      key={teamName}
                      type="button"
                      className={`${styles.chipButton} ${
                        preferences.favoriteTeams.includes(teamName) ? styles.chipButtonActive : ""
                      }`}
                      onClick={() => handleToggleTeam(teamName)}
                    >
                      {teamName}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.preferenceGroup}>
                <h4>Featured leagues</h4>
                <div className={styles.chipList}>
                  {(homeFeed?.follow_options?.leagues || []).map((leagueName) => (
                    <button
                      key={leagueName}
                      type="button"
                      className={`${styles.chipButton} ${
                        preferences.favoriteLeagues.includes(leagueName) ? styles.chipButtonActive : ""
                      }`}
                      onClick={() => handleToggleLeague(leagueName)}
                    >
                      {leagueName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.guideRail} id="starter-slip">
            <article className={styles.starterSlipCard}>
              <p className={styles.cardEyebrow}>Starter slip</p>
              <h3>{homeFeed?.starter_slip?.title || "Starter accumulator"}</h3>
              <p>{homeFeed?.starter_slip?.summary}</p>
              <ul className={styles.starterList}>
                {(homeFeed?.starter_slip?.selections || []).map((selection) => (
                  <li key={`${selection.fixture_id}-${selection.selection}`}>
                    {selection.home_team} vs {selection.away_team} | {selection.selection} @ {selection.odd_rate}
                  </li>
                ))}
              </ul>
              <div className={styles.starterFooter}>
                <span>Combined odd: {homeFeed?.starter_slip?.combined_odd || "0.00"}</span>
                <button className={styles.primaryButton} type="button" onClick={applyStarterSlip}>
                  Add to basket
                </button>
              </div>
            </article>
            <article className={styles.onboardingCard}>
              <p className={styles.cardEyebrow}>New user path</p>
              <h3>Complete one simple action at a time</h3>
              <div className={styles.stepList}>
                {(homeFeed?.onboarding_steps || []).map((step) => (
                  <div className={styles.stepItem} key={step.id}>
                    <div className={styles.stepTitleRow}>
                      <strong>{step.title}</strong>
                      <span
                        className={`${styles.stepBadge} ${
                          stepCompletionMap[step.id] ? styles.stepBadgeDone : ""
                        }`}
                      >
                        {stepCompletionMap[step.id] ? "Done" : "Next"}
                      </span>
                    </div>
                    <p>{step.description}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className={styles.predictionPanel}>
            <article className={styles.predictionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.cardEyebrow}>Free prediction mode</p>
                  <h2>Make one no-stakes call on today&apos;s spotlight fixture</h2>
                </div>
              </div>
              {homeFeed?.spotlight ? (
                <>
                  <p className={styles.predictionCopy}>
                    Use this as a low-pressure way to join the matchday flow before placing a real
                    order. Your latest free prediction is saved to your profile.
                  </p>
                  <div className={styles.predictionFixture}>
                    <strong>{homeFeed.spotlight.title}</strong>
                    <span>
                      {homeFeed.spotlight.league_name} | {formatKickoff(homeFeed.spotlight.kickoff)}
                    </span>
                  </div>
                  <div className={styles.predictionActions}>
                    {[
                      { result: 0, label: "Home" },
                      { result: 1, label: "Draw" },
                      { result: 2, label: "Away" },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        className={`${styles.predictionButton} ${
                          spotlightPrediction?.predictedLabel === option.label
                            ? styles.predictionButtonActive
                            : ""
                        }`}
                        onClick={() => submitFreePrediction(option.result, option.label)}
                        disabled={isSubmittingPrediction}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {spotlightPrediction && (
                    <p className={styles.predictionStatus}>
                      Latest prediction: {spotlightPrediction.predictedLabel} | Status:{" "}
                      {spotlightPrediction.result}
                    </p>
                  )}
                  {predictionFeedback && <p className={styles.feedback}>{predictionFeedback}</p>}
                </>
              ) : (
                <p className={styles.predictionCopy}>A spotlight fixture is not available yet.</p>
              )}
            </article>
          </section>

          <section className={styles.insightGrid}>
            <article className={styles.metricCard}>
              <p className={styles.cardEyebrow}>Today</p>
              <h3>{entries.length}</h3>
              <p>fixtures ready to browse right now</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.cardEyebrow}>Community</p>
              <h3>{activeCustomOddCount}</h3>
              <p>active custom odds posts across the current matchday feed</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.cardEyebrow}>Learn</p>
              <h3>{homeFeed?.beginner_guides?.length || 0}</h3>
              <p>starter guides to help casual fans understand how to play</p>
            </article>
          </section>

          <section className={styles.guideGrid}>
            {(homeFeed?.beginner_guides || []).map((guide) => (
              <article className={styles.guideCard} key={guide.id}>
                <p className={styles.cardEyebrow}>Beginner guide</p>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
                <span className={styles.guideCta}>{guide.cta_label}</span>
              </article>
            ))}
          </section>

          {(homeFeed?.trending_custom_odds?.length || 0) > 0 && (
            <section className={styles.trendingPanel}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.cardEyebrow}>Trending now</p>
                  <h2>Fixtures with the most community custom odds</h2>
                </div>
              </div>
              <div className={styles.trendingGrid}>
                {homeFeed.trending_custom_odds.map((item) => (
                  <article className={styles.trendingCard} key={item.fixture_id}>
                    <h3>{item.title}</h3>
                    <p className={styles.cardMeta}>
                      {item.league_name} | {formatKickoff(item.kickoff)}
                    </p>
                    <p>{item.custom_odd_count} custom odds posts live before kickoff.</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className={styles.fixtureSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.cardEyebrow}>Recommended fixtures</p>
                <h2>Upcoming matches, sorted around your preferences when available</h2>
              </div>
              <p className={styles.sectionCopy}>
                We surface followed clubs and leagues first, then fall back to kickoff order for the rest of the board.
              </p>
            </div>
            {loading && <Loader />}
            {!loading && showMobileOrder && <HomeReceipt isMobile={true} />}
            {!loading && entryComponent}
          </section>
        </div>
        <div className={styles.dashboardColumn}>
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
