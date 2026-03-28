import styles from "./Home.module.css";
import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import GameEntry from "../GameEntry";
import HomeReceipt from "../HomeReceipt";
import HomeOrder from "../HomeOrder";
import NotificationsPanel from "../NotificationsPanel";
import SiteFooter from "../SiteFooter";
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

function Home() {
  const [entries, setEntries] = useState([]);
  const [homeFeed, setHomeFeed] = useState(null);
  const [customOddsByFixture, setCustomOddsByFixture] = useState({});
  const [ownCustomOddsByFixture, setOwnCustomOddsByFixture] = useState({});
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(getDefaultHomePreferences());
  const [predictionFeedback, setPredictionFeedback] = useState("");
  const [isSubmittingPrediction, setIsSubmittingPrediction] = useState(false);
  const [leaderboardPreview, setLeaderboardPreview] = useState({
    leaderboard: [],
    hotThisWeek: [],
  });
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

  useEffect(() => {
    let isMounted = true;

    async function loadLeaderboardPreview() {
      try {
        const response = await fetch("https://service.yolofootball.com/api/predictions/leaderboard", {
          method: "GET",
          headers: {
            ...(getCookie("access_token")
              ? { Authorization: getCookie("access_token") }
              : {}),
          },
        });
        const data = await readJsonSafely(response);
        if (!response.ok || !isMounted) {
          return;
        }

        setLeaderboardPreview({
          leaderboard: Array.isArray(data?.leaderboard) ? data.leaderboard.slice(0, 3) : [],
          hotThisWeek: Array.isArray(data?.hotThisWeek) ? data.hotThisWeek.slice(0, 3) : [],
        });
      } catch (error) {
        console.error("Failed to load leaderboard preview", error);
      }
    }

    loadLeaderboardPreview();

    return () => {
      isMounted = false;
    };
  }, [appContext.userProfile?.userName]);

  const sortedEntries = useMemo(
    () => sortFixturesForHome(entries, preferences),
    [entries, preferences]
  );

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

  const trendingCustomOdds = Array.isArray(homeFeed?.trending_custom_odds)
    ? homeFeed.trending_custom_odds.slice(0, 3)
    : [];
  const leaderboardEntries = leaderboardPreview.leaderboard || [];
  const hotPlayers = leaderboardPreview.hotThisWeek || [];

  const starterSelections = Array.isArray(homeFeed?.starter_slip?.selections)
    ? homeFeed.starter_slip.selections.slice(0, 2)
    : [];

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
        "Browse football fixtures, follow favorite clubs, make free predictions, and explore custom odds on yolofootball.",
    },
  ];

  return (
    <>
      <SeoHead
        title="Football picks, alerts, and custom odds"
        description="Browse football fixtures, follow clubs you care about, make a free prediction, and explore community custom odds on yolofootball."
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
        <div className={styles.games}>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Matchday made simple</p>
              <h1 className={styles.pageTitle}>Start with today&apos;s spotlight, then move straight into the board.</h1>
              <p className={styles.pageDescription}>
                yolofootball keeps the homepage focused on what helps you act now: one guided slip,
                one quick prediction, your unread alerts, and the fixtures worth checking next.
              </p>
              <div className={styles.heroActions}>
                <button className={styles.primaryButton} type="button" onClick={applyStarterSlip}>
                  Load starter slip
                </button>
                <a href="/insights" className={styles.secondaryButton}>
                  Explore insights
                </a>
              </div>
              {(starterSelections.length > 0 || homeFeed?.starter_slip?.combined_odd) && (
                <div className={styles.heroSummary}>
                  {homeFeed?.starter_slip?.combined_odd && (
                    <span className={styles.heroSummaryItem}>
                      Combined odd {homeFeed.starter_slip.combined_odd}
                    </span>
                  )}
                  {starterSelections.map((selection) => (
                    <span
                      key={`${selection.fixture_id}-${selection.selection}`}
                      className={styles.heroSummaryItem}
                    >
                      {selection.selection} in {selection.home_team} vs {selection.away_team}
                    </span>
                  ))}
                </div>
              )}
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

          <section className={styles.actionCenterSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.cardEyebrow}>Action center</p>
                <h2>See what needs attention, then make one light matchday move.</h2>
              </div>
              <p className={styles.sectionCopy}>
                Alerts keep your follows visible, while the compact prediction card gives casual
                fans one low-pressure way to participate.
              </p>
            </div>
            <div className={styles.actionCenterGrid}>
              <NotificationsPanel
                title="Unread matchday alerts"
                description={
                  appContext.userProfile?.userName
                    ? "Kickoff reminders, prediction results, order settlements, and custom odds updates show up here first."
                    : "Sign in to turn follows, predictions, and order activity into readable alerts."
                }
                notifications={appContext.notifications}
                emptyTitle={
                  appContext.userProfile?.userName
                    ? "You are all caught up."
                    : "No alerts yet."
                }
                emptyDescription={
                  appContext.userProfile?.userName
                    ? "New activity will land here as matches approach kickoff or your recent actions settle."
                    : "Create an account and follow a few teams to start seeing alerts here."
                }
                limit={3}
                isBusy={appContext.isNotificationsBusy}
                onMarkRead={appContext.userProfile?.userName ? markNotificationRead : undefined}
              />
              <article className={styles.predictionCard}>
                <p className={styles.cardEyebrow}>Free prediction</p>
                <h3>
                  {homeFeed?.spotlight?.title || "Make a quick no-stakes matchday call"}
                </h3>
                <p className={styles.predictionCopy}>
                  Keep it simple: one fixture, three choices, and your latest pick saved to your
                  profile.
                </p>
                {homeFeed?.spotlight ? (
                  <>
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
            </div>
          </section>

          <section className={styles.preferencePanel} id="follow">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.cardEyebrow}>Personalize</p>
                <h2>Follow teams and leagues you want to surface first.</h2>
              </div>
              <p className={styles.sectionCopy}>
                Signed-in users save follows to their account, while guests can keep a lighter local
                version on this device.
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

          {trendingCustomOdds.length > 0 && (
            <section className={styles.trendingPanel}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.cardEyebrow}>Trending custom odds</p>
                  <h2>See where community pricing is already heating up.</h2>
                </div>
                <p className={styles.sectionCopy}>
                  We keep this short on the homepage so you can sense momentum without losing the
                  main fixture board.
                </p>
              </div>
              <div className={styles.trendingGrid}>
                {trendingCustomOdds.map((item) => (
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

          <section className={styles.leaderboardSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.cardEyebrow}>Prediction leaderboard</p>
                <h2>See who is calling results well and who is running hot this week.</h2>
              </div>
              <p className={styles.sectionCopy}>
                Free prediction is now more than a side action. Accuracy and streaks give players a
                reason to come back and keep their run going.
              </p>
            </div>
            <div className={styles.leaderboardGrid}>
              <article className={styles.leaderboardCard}>
                <div className={styles.leaderboardHeader}>
                  <h3>Top accuracy</h3>
                  <a href="/leaderboard" className={styles.secondaryButton}>
                    Full board
                  </a>
                </div>
                {leaderboardEntries.length > 0 ? (
                  <div className={styles.rankList}>
                    {leaderboardEntries.map((entry) => (
                      <div key={`${entry.userName}-${entry.rank}`} className={styles.rankItem}>
                        <div>
                          <strong>
                            #{entry.rank} {entry.userName}
                          </strong>
                          <p>
                            Accuracy {entry.predictionSummary.accuracy}% | Settled{" "}
                            {entry.predictionSummary.settledPredictions}
                          </p>
                        </div>
                        <span className={styles.rankBadge}>
                          {entry.predictionSummary.currentStreak}W streak
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyLeaderboardState}>
                    The board will fill in as more free predictions settle.
                  </p>
                )}
              </article>
              <article className={styles.leaderboardCard}>
                <div className={styles.leaderboardHeader}>
                  <h3>Hot this week</h3>
                  <a href="/leaderboard" className={styles.secondaryButton}>
                    View details
                  </a>
                </div>
                {hotPlayers.length > 0 ? (
                  <div className={styles.rankList}>
                    {hotPlayers.map((entry) => (
                      <div key={`hot-${entry.userName}-${entry.rank}`} className={styles.rankItem}>
                        <div>
                          <strong>
                            #{entry.rank} {entry.userName}
                          </strong>
                          <p>
                            Weekly wins {entry.predictionSummary.weeklyWins} | Accuracy{" "}
                            {entry.predictionSummary.weeklyAccuracy}%
                          </p>
                        </div>
                        <span className={styles.rankBadge}>
                          Best {entry.predictionSummary.bestStreak}W
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyLeaderboardState}>
                    Weekly momentum will show up once a few settled predictions land.
                  </p>
                )}
              </article>
            </div>
          </section>

          <section className={styles.fixtureSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.cardEyebrow}>Recommended fixtures</p>
                <h2>Upcoming matches, sorted around your preferences when available.</h2>
              </div>
              <p className={styles.sectionCopy}>
                Followed clubs and leagues surface first, then the rest of the board falls back to
                kickoff order.
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
      <SiteFooter />
    </>
  );
}

export default Home;
