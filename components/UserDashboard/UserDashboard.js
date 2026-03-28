import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppContext from "../../helper/AppContext";
import { getCookie } from "../../helper/cookieHelper";
import { getApiMessage, readJsonSafely } from "../../helper/apiResponse";
import normalizeUserProfile from "../../helper/normalizeUserProfile";
import HomeLogo from "../HomeLogo";
import HomeMenu from "../HomeMenu";
import Loader from "../Loader";
import SeoHead from "../SeoHead";
import styles from "./UserDashboard.module.css";

const formatCurrency = (value) => {
  const numericValue = Number(value || 0);
  return `$${numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) {
    return "Unavailable";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Unavailable";
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "Unavailable";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Unavailable";
  }

  return parsedDate.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getOrderStatusLabel = (order) => {
  if (order?.orderResult === "won") {
    return "Won";
  }
  if (order?.orderResult === "lost") {
    return "Lost";
  }
  if (order?.isSettled) {
    return "Settled";
  }
  return "Pending";
};

const getOrderStatusClassName = (order) => {
  if (order?.orderResult === "won") {
    return styles.badgePositive;
  }
  if (order?.orderResult === "lost") {
    return styles.badgeNegative;
  }
  if (order?.isSettled) {
    return styles.badgeNeutral;
  }
  return styles.badgeWarning;
};

const getEventStatusClassName = (event) => {
  if (event?.status === "completed") {
    return styles.badgePositive;
  }
  if (event?.status === "canceled") {
    return styles.badgeNegative;
  }
  if (event?.status === "locked") {
    return styles.badgeNeutral;
  }
  return styles.badgeWarning;
};

const getPredictionStatusClassName = (prediction) => {
  if (prediction?.result === "won") {
    return styles.badgePositive;
  }
  if (prediction?.result === "lost") {
    return styles.badgeNegative;
  }
  return styles.badgeWarning;
};

const getOrderTitle = (order) => {
  if (order?.selectionCount > 1) {
    return `${order.selectionCount} picks accumulator`;
  }

  const homeTeam = order?.fixture?.teams?.home?.name;
  const awayTeam = order?.fixture?.teams?.away?.name;
  if (homeTeam && awayTeam) {
    return `${homeTeam} vs ${awayTeam}`;
  }

  return order?.id || "Order";
};

const getEventTitle = (event) => {
  const homeTeam = event?.fixture?.teams?.home?.name;
  const awayTeam = event?.fixture?.teams?.away?.name;
  if (homeTeam && awayTeam) {
    return `${homeTeam} vs ${awayTeam}`;
  }

  return event?.market === "match_winner" ? "Match winner market" : "Custom event";
};

const getOrderSubtitle = (order) => {
  if (order?.fixture?.league?.name && order?.fixture?.date) {
    return `${order.fixture.league.name} | ${formatDateTime(order.fixture.date)}`;
  }

  return `Order id: ${order?.id || "Unavailable"}`;
};

const getEventSubtitle = (event) => {
  if (event?.fixture?.league?.name && event?.fixture?.date) {
    return `${event.fixture.league.name} | Kickoff ${formatDateTime(event.fixture.date)}`;
  }

  return `Created ${formatDateTime(event?.createdDate)}`;
};

const getOddSummary = (oddData) => {
  if (!Array.isArray(oddData?.options) || oddData.options.length === 0) {
    return "Odds unavailable";
  }

  return oddData.options
    .map((option) => `${option.label} ${Number(option.odd || 0).toFixed(2)}`)
    .join(" | ");
};

const isCustomEventCancelable = (event) => {
  const fixtureStatus = event?.fixture?.status;
  const hasLinkedOrders =
    Array.isArray(event?.associatedOrderIds) && event.associatedOrderIds.length > 0;

  return (
    event?.status === "active" &&
    !hasLinkedOrders &&
    (fixtureStatus === "NS" || (!fixtureStatus && event?.fixtureState === "notstarted"))
  );
};

function UserDashboard() {
  const { appContext, setAppContext } = useContext(AppContext);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [cancelingEventId, setCancelingEventId] = useState("");
  const [eventActionError, setEventActionError] = useState({
    eventId: "",
    message: "",
  });
  const router = useRouter();
  const profile = appContext.userProfile;

  const loadProfile = async () => {
    const accessToken = getCookie("access_token");
    if (!accessToken) {
      setAppContext((currentContext) => ({
        ...currentContext,
        userProfile: undefined,
        isAuthResolved: true,
      }));
      router.replace("/login");
      return false;
    }

    const response = await fetch("https://service.yolofootball.com/api/users/profile", {
      method: "GET",
      headers: {
        Authorization: accessToken,
      },
    });
    const data = await readJsonSafely(response);

    if (response.ok && data?.message === "succeed") {
      setAppContext((currentContext) => ({
        ...currentContext,
        userProfile: normalizeUserProfile(data.userProfile),
        isAuthResolved: true,
      }));
      return true;
    }

    setAppContext((currentContext) => ({
      ...currentContext,
      userProfile: undefined,
      isAuthResolved: true,
    }));
    router.replace("/login");
    return false;
  };

  const cancelCustomEvent = async (eventId) => {
    const accessToken = getCookie("access_token");
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    setCancelingEventId(eventId);
    setEventActionError({
      eventId: "",
      message: "",
    });

    try {
      const response = await fetch(
        `https://service.yolofootball.com/api/events/${eventId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        }
      );
      const data = await readJsonSafely(response);

      if (!response.ok) {
        setEventActionError({
          eventId,
          message: getApiMessage(data, "Unable to cancel custom odds."),
        });
        return;
      }

      await loadProfile();
      setEventActionError({
        eventId: "",
        message: "",
      });
    } catch (error) {
      setEventActionError({
        eventId,
        message: "Unable to cancel custom odds.",
      });
    } finally {
      setCancelingEventId("");
    }
  };

  useEffect(() => {
    if (!appContext.isAuthResolved) {
      return;
    }

    const accessToken = getCookie("access_token");
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    async function refreshCurrentProfile() {
      setIsLoadingProfile(true);

      try {
        const isRefreshed = await loadProfile();
        if (!isMounted || !isRefreshed) {
          return;
        }
      } catch (error) {
        console.error("Failed to refresh user profile", error);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    refreshCurrentProfile();

    return () => {
      isMounted = false;
    };
  }, [appContext.isAuthResolved, router, setAppContext]);

  const shouldShowLoader =
    !appContext.isAuthResolved || (isLoadingProfile && !profile);

  return (
    <>
      <SeoHead
        title="Your account dashboard"
        description="Review your yolofootball account details, balance, recent orders, and created custom events."
        path="/user"
        noindex={true}
      />
      <div className={styles.header}>
        <nav className={styles.navbar}>
          <HomeLogo />
          <HomeMenu />
        </nav>
      </div>
      <div className={styles.content}>
        {shouldShowLoader || !profile ? (
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        ) : (
          <div className={styles.dashboard}>
            <section className={styles.hero}>
              <p className={styles.eyebrow}>Private account dashboard</p>
              <h1 className={styles.pageTitle}>{profile.userName}</h1>
              <p className={styles.pageDescription}>
                Track your wallet, review recent activity, and keep an eye on the
                custom markets you have created.
              </p>
            </section>

            <section className={styles.topGrid}>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Account</h2>
                  <span
                    className={`${styles.badge} ${
                      profile.isValidUser ? styles.badgePositive : styles.badgeWarning
                    }`}
                  >
                    {profile.isValidUser ? "Verified" : "Pending verification"}
                  </span>
                </div>
                <div className={styles.definitionGrid}>
                  <div>
                    <span className={styles.label}>Email</span>
                    <p>{profile.userEmail || "Unavailable"}</p>
                  </div>
                  <div>
                    <span className={styles.label}>Wallet</span>
                    <p>{profile.walletId || "Unavailable"}</p>
                  </div>
                  <div>
                    <span className={styles.label}>User ID</span>
                    <p>{profile.userId || "Unavailable"}</p>
                  </div>
                  <div>
                    <span className={styles.label}>Preferred culture</span>
                    <p>{profile.preferredCulture || "Unavailable"}</p>
                  </div>
                  <div>
                    <span className={styles.label}>Member since</span>
                    <p>{formatDate(profile.createdDate)}</p>
                  </div>
                  <div>
                    <span className={styles.label}>Favorite teams</span>
                    <p>
                      {profile.favoriteTeams?.length > 0
                        ? profile.favoriteTeams.join(", ")
                        : "No teams followed yet"}
                    </p>
                  </div>
                  <div>
                    <span className={styles.label}>Favorite leagues</span>
                    <p>
                      {profile.favoriteLeagues?.length > 0
                        ? profile.favoriteLeagues.join(", ")
                        : "No leagues followed yet"}
                    </p>
                  </div>
                </div>
              </article>

              <article className={`${styles.card} ${styles.walletCard}`}>
                <span className={styles.walletLabel}>Account balance</span>
                <p className={styles.walletAmount}>{formatCurrency(profile.userBalance)}</p>
                <p className={styles.walletHint}>
                  Current wallet value available from your stored account profile.
                </p>
              </article>
            </section>

            <section className={styles.statGrid}>
              <article className={styles.statCard}>
                <span className={styles.label}>Total orders</span>
                <p className={styles.statValue}>{profile.orderCount}</p>
              </article>
              <article className={styles.statCard}>
                <span className={styles.label}>Custom events created</span>
                <p className={styles.statValue}>{profile.customEventCount}</p>
              </article>
              <article className={styles.statCard}>
                <span className={styles.label}>Free predictions</span>
                <p className={styles.statValue}>{profile.predictionCount}</p>
              </article>
            </section>

            <section className={styles.activityGrid}>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Recent orders</h2>
                  <span className={styles.sectionNote}>Latest 5</span>
                </div>
                {profile.recentOrders.length === 0 ? (
                  <p className={styles.emptyState}>
                    No orders yet. Your next bet slip will show up here.
                  </p>
                ) : (
                  <div className={styles.activityList}>
                    {profile.recentOrders.map((order) => (
                      <div key={order.id} className={styles.activityItem}>
                        <div className={styles.activityHeader}>
                          <div>
                            <h3>{getOrderTitle(order)}</h3>
                            <p className={styles.activityMeta}>{getOrderSubtitle(order)}</p>
                          </div>
                          <span
                            className={`${styles.badge} ${getOrderStatusClassName(order)}`}
                          >
                            {getOrderStatusLabel(order)}
                          </span>
                        </div>
                        <p className={styles.activityDetail}>
                          Stake {formatCurrency(order.stake)} | Potential{" "}
                          {formatCurrency(order.winReturn)}
                          {order.settledWinReturn !== null
                            ? ` | Settled ${formatCurrency(order.settledWinReturn)}`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Recent custom events</h2>
                  <span className={styles.sectionNote}>Latest 5</span>
                </div>
                {profile.recentCustomEvents.length === 0 ? (
                  <p className={styles.emptyState}>
                    You have not created any custom events yet.
                  </p>
                ) : (
                  <div className={styles.activityList}>
                    {profile.recentCustomEvents.map((event) => (
                      <div key={event.id} className={styles.activityItem}>
                        <div className={styles.activityHeader}>
                          <div>
                            <h3>{getEventTitle(event)}</h3>
                            <p className={styles.activityMeta}>{getEventSubtitle(event)}</p>
                          </div>
                          <span
                            className={`${styles.badge} ${getEventStatusClassName(event)}`}
                          >
                            {event.status}
                          </span>
                        </div>
                        <p className={styles.activityDetail}>{getOddSummary(event.oddData)}</p>
                        <p className={styles.activityDetail}>
                          Orders linked {event.associatedOrderIds.length} | Created{" "}
                          {formatDateTime(event.createdDate)}
                        </p>
                        {isCustomEventCancelable(event) && (
                          <div className={styles.activityActionRow}>
                            <button
                              type="button"
                              className={styles.secondaryActionButton}
                              onClick={() => cancelCustomEvent(event.id)}
                              disabled={cancelingEventId === event.id}
                            >
                              {cancelingEventId === event.id
                                ? "Canceling..."
                                : "Cancel custom odd"}
                            </button>
                          </div>
                        )}
                        {eventActionError.eventId === event.id && eventActionError.message && (
                          <p className={styles.actionError}>{eventActionError.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Recent predictions</h2>
                  <span className={styles.sectionNote}>Latest 5</span>
                </div>
                {profile.recentPredictions.length === 0 ? (
                  <p className={styles.emptyState}>
                    No free predictions yet. Make one from today&apos;s spotlight fixture on the
                    home page.
                  </p>
                ) : (
                  <div className={styles.activityList}>
                    {profile.recentPredictions.map((prediction) => (
                      <div
                        key={prediction.id || `${prediction.fixtureId}-${prediction.createdAt}`}
                        className={styles.activityItem}
                      >
                        <div className={styles.activityHeader}>
                          <div>
                            <h3>
                              {prediction.fixture?.teams?.home?.name} vs{" "}
                              {prediction.fixture?.teams?.away?.name}
                            </h3>
                            <p className={styles.activityMeta}>
                              {prediction.fixture?.league?.name || "Fixture"} |{" "}
                              {formatDateTime(prediction.fixture?.date || prediction.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`${styles.badge} ${getPredictionStatusClassName(
                              prediction
                            )}`}
                          >
                            {prediction.result}
                          </span>
                        </div>
                        <p className={styles.activityDetail}>
                          Picked {prediction.predictedLabel || prediction.predictedResult}
                          {prediction.actualResult !== null
                            ? ` | Actual result ${prediction.actualResult}`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <h5>&reg;2023 Yolofootball.com. All rights reserved.</h5>
      </div>
    </>
  );
}

export default UserDashboard;
