import { useContext, useState } from "react";
import OddButton from "../Basic/OddButton";
import AppContext from "../../helper/AppContext";
import { getCookie } from "../../helper/cookieHelper";
import { getApiMessage, readJsonSafely } from "../../helper/apiResponse";
import styles from "./GameEntry.module.css";

const isFiniteOdd = (value) => Number.isFinite(parseFloat(value));
const formatOddForDisplay = (value) =>
  isFiniteOdd(value) ? Number(parseFloat(value).toFixed(2)) : null;

const formatCurrency = (value) => {
  const numericValue = Number(value || 0);
  return `$${numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getOptionMaxStake = (customEvent, result) =>
  Number(customEvent?.max_stake_by_result?.[result] || 0);

const getEventAvailabilityMessage = (customEvent, isFixtureNotStarted) => {
  if (!isFixtureNotStarted) {
    return "Kickoff has passed for this fixture.";
  }
  if (!customEvent?.can_accept_bets) {
    if (customEvent?.is_owner) {
      return "You cannot bet on your own post.";
    }
    if (customEvent?.has_viewer_bet) {
      return "You already have an active bet on this post.";
    }
    if (Number(customEvent?.pool_fund || 0) <= 0) {
      return "The owner needs to top up this post before it can accept bets.";
    }
    return "This post is not accepting bets right now.";
  }

  return "";
};

function GameEntry({
  id,
  home,
  away,
  odd,
  fixture,
  league,
  customEvents = [],
  ownCustomEvent = null,
  canCreateCustomOdds,
  onCustomOddsChanged,
  onCustomOddsCreated,
}) {
  const { setAppContext, refreshUserProfile } = useContext(AppContext);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [isOwnModalOpen, setIsOwnModalOpen] = useState(false);
  const [activeBetDraft, setActiveBetDraft] = useState(null);
  const [customOddForm, setCustomOddForm] = useState({
    homeOdd: "",
    drawOdd: "",
    awayOdd: "",
    poolFund: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundError, setFundError] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [betStake, setBetStake] = useState("");
  const [betError, setBetError] = useState("");
  const [isBetting, setIsBetting] = useState(false);

  const accessToken = getCookie("access_token");
  const eventDate = fixture?.date || null;
  const leagueName = league?.name || "League";
  const leagueLogo = league?.logo || "";
  const oddsContent = Array.isArray(odd?.bets?.[0]?.values) ? odd.bets[0].values : [];
  const homeOdd = formatOddForDisplay(oddsContent[0]?.odd);
  const drawOdd = formatOddForDisplay(oddsContent[1]?.odd);
  const awayOdd = formatOddForDisplay(oddsContent[2]?.odd);
  const gameTitle = `${home || "Home"} vs ${away || "Away"}`;
  const customOddsList = Array.isArray(customEvents) ? customEvents : [];
  const customOddsCount = customOddsList.length;
  const activeOwnCustomEvent = ownCustomEvent?.status === "active" ? ownCustomEvent : null;
  const isFixtureNotStarted = fixture?.status?.short === "NS";
  const canCancelOwnCustomOdd =
    !!activeOwnCustomEvent &&
    isFixtureNotStarted &&
    Array.isArray(activeOwnCustomEvent.associated_order_ids) &&
    activeOwnCustomEvent.associated_order_ids.length === 0;
  const canOpenCreateModal = canCreateCustomOdds && isFixtureNotStarted && !activeOwnCustomEvent;
  const canFundOwnCustomOdd = !!activeOwnCustomEvent && isFixtureNotStarted;
  const activeBetMaxStake = activeBetDraft
    ? getOptionMaxStake(activeBetDraft.customEvent, activeBetDraft.option.result)
    : 0;

  const formattedEventDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : "Kickoff unavailable";

  const refreshCustomOdds = async () => {
    if (onCustomOddsChanged) {
      await onCustomOddsChanged();
      return;
    }
    if (onCustomOddsCreated) {
      await onCustomOddsCreated();
    }
  };

  const refreshActiveOrders = async () => {
    if (!accessToken) {
      return;
    }

    try {
      const response = await fetch(
        "https://service.yolofootball.com/api/orders/getHydratedOrders",
        {
          method: "POST",
          body: JSON.stringify({
            order_state: "pending",
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        }
      );
      const data = await readJsonSafely(response);

      if (!response.ok) {
        return;
      }

      setAppContext((currentContext) => ({
        ...currentContext,
        userActiveOrder: {
          ...currentContext.userActiveOrder,
          orders: Array.isArray(data) ? data : [],
        },
      }));
    } catch (error) {
      console.error("Failed to refresh active orders", error);
    }
  };

  const refreshAfterMutation = async ({ refreshOrders = false } = {}) => {
    await Promise.all([
      refreshCustomOdds(),
      refreshUserProfile ? refreshUserProfile({ accessToken }) : Promise.resolve(),
      refreshOrders ? refreshActiveOrders() : Promise.resolve(),
    ]);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSubmitError("");
    setCustomOddForm({
      homeOdd: "",
      drawOdd: "",
      awayOdd: "",
      poolFund: "",
    });
  };

  const closeOwnModal = () => {
    setIsOwnModalOpen(false);
    setCancelError("");
    setFundError("");
    setFundAmount("");
    setIsConfirmingCancel(false);
  };

  const closeBetModal = () => {
    setActiveBetDraft(null);
    setBetStake("");
    setBetError("");
  };

  const openCreateModal = () => {
    if (!canCreateCustomOdds) {
      alert("Please sign in before creating custom odds.");
      return;
    }
    if (!isFixtureNotStarted) {
      alert("Custom odds can only be created before kickoff.");
      return;
    }
    if (activeOwnCustomEvent) {
      openOwnModal();
      return;
    }

    setSubmitError("");
    setIsCreateModalOpen(true);
  };

  const openBrowseModal = () => {
    setIsBrowseModalOpen(true);
  };

  const openOwnModal = () => {
    setCancelError("");
    setFundError("");
    setFundAmount("");
    setIsConfirmingCancel(false);
    setIsOwnModalOpen(true);
  };

  const openBetModal = (customEvent, option) => {
    if (!accessToken) {
      alert("Please sign in before placing a custom bet.");
      return;
    }

    const availabilityMessage = getEventAvailabilityMessage(customEvent, isFixtureNotStarted);
    if (availabilityMessage) {
      alert(availabilityMessage);
      return;
    }

    const maxStake = getOptionMaxStake(customEvent, option.result);
    setBetStake(maxStake > 0 ? Math.min(maxStake, 25).toFixed(2) : "");
    setBetError("");
    setActiveBetDraft({
      customEvent,
      option,
    });
  };

  const updateField = (fieldName, value) => {
    setCustomOddForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  };

  const shareFixture = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/?fixture=${id}`
        : `https://www.yolofootball.com/?fixture=${id}`;
    const sharePayload = {
      title: `${gameTitle} on yolofootball`,
      text: `Check out ${gameTitle} and today's matchday odds on yolofootball.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareFeedback("Share link ready.");
    } catch (error) {
      setShareFeedback("Share canceled.");
    }
  };

  const submitCustomOdds = async (event) => {
    event.preventDefault();

    const numericOdds = [
      parseFloat(customOddForm.homeOdd),
      parseFloat(customOddForm.drawOdd),
      parseFloat(customOddForm.awayOdd),
    ];
    const poolFund = parseFloat(customOddForm.poolFund);
    if (!numericOdds.every((oddValue) => Number.isFinite(oddValue) && oddValue > 1)) {
      setSubmitError("Please enter odds greater than 1.00 for Home, Draw, and Away.");
      return;
    }
    if (!Number.isFinite(poolFund) || poolFund <= 0) {
      setSubmitError("Please reserve a pool fund greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("https://service.yolofootball.com/api/events", {
        method: "POST",
        body: JSON.stringify({
          fixture_id: id,
          pool_fund: poolFund,
          odd_data: {
            market: "match_winner",
            options: [
              { result: 0, label: "Home", odd: numericOdds[0] },
              { result: 1, label: "Draw", odd: numericOdds[1] },
              { result: 2, label: "Away", odd: numericOdds[2] },
            ],
          },
        }),
        headers: {
          "Content-Type": "application/json",
          authorization: `${accessToken}`,
        },
      });
      const data = await readJsonSafely(response);

      if (!response.ok) {
        setSubmitError(getApiMessage(data, "Unable to post custom odds."));
        return;
      }

      closeCreateModal();
      await refreshAfterMutation();
      alert("Custom odds posted successfully.");
    } catch (error) {
      setSubmitError("Unable to post custom odds.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTopUp = async (event) => {
    event.preventDefault();
    if (!activeOwnCustomEvent) {
      return;
    }

    const additionalPoolFund = parseFloat(fundAmount);
    if (!Number.isFinite(additionalPoolFund) || additionalPoolFund <= 0) {
      setFundError("Please enter a top-up amount greater than 0.");
      return;
    }

    setIsFunding(true);
    setFundError("");

    try {
      const response = await fetch(
        `https://service.yolofootball.com/api/events/${activeOwnCustomEvent.id}/fund`,
        {
          method: "PUT",
          body: JSON.stringify({
            additional_pool_fund: additionalPoolFund,
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: `${accessToken}`,
          },
        }
      );
      const data = await readJsonSafely(response);

      if (!response.ok) {
        setFundError(getApiMessage(data, "Unable to fund custom odds."));
        return;
      }

      setFundAmount("");
      await refreshAfterMutation();
      alert("Custom odds pool funded successfully.");
    } catch (error) {
      setFundError("Unable to fund custom odds.");
    } finally {
      setIsFunding(false);
    }
  };

  const cancelOwnCustomOdds = async () => {
    if (!activeOwnCustomEvent) {
      setCancelError("Your active custom odd could not be found.");
      return;
    }

    setIsCanceling(true);
    setCancelError("");

    try {
      const response = await fetch(
        `https://service.yolofootball.com/api/events/${activeOwnCustomEvent.id}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `${accessToken}`,
          },
        }
      );
      const data = await readJsonSafely(response);

      if (!response.ok) {
        setCancelError(getApiMessage(data, "Unable to cancel custom odds."));
        return;
      }

      await refreshAfterMutation();
      closeOwnModal();
      alert("Custom odds canceled successfully.");
    } catch (error) {
      setCancelError("Unable to cancel custom odds.");
    } finally {
      setIsCanceling(false);
    }
  };

  const placeCustomBet = async (event) => {
    event.preventDefault();

    if (!activeBetDraft) {
      return;
    }

    const numericStake = parseFloat(betStake);
    if (!Number.isFinite(numericStake) || numericStake <= 0) {
      setBetError("Please enter a stake greater than 0.");
      return;
    }

    if (numericStake > activeBetMaxStake) {
      setBetError(`Stake exceeds the current max of ${formatCurrency(activeBetMaxStake)}.`);
      return;
    }

    setIsBetting(true);
    setBetError("");

    try {
      const response = await fetch(
        `https://service.yolofootball.com/api/events/${activeBetDraft.customEvent.id}/bets`,
        {
          method: "POST",
          body: JSON.stringify({
            bet_result: activeBetDraft.option.result,
            stake: numericStake,
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: `${accessToken}`,
          },
        }
      );
      const data = await readJsonSafely(response);

      if (!response.ok) {
        setBetError(getApiMessage(data, "Unable to place this custom bet."));
        return;
      }

      await refreshAfterMutation({ refreshOrders: true });
      closeBetModal();
      setIsBrowseModalOpen(false);
      alert("Custom bet placed successfully.");
    } catch (error) {
      setBetError("Unable to place this custom bet.");
    } finally {
      setIsBetting(false);
    }
  };

  return (
    <>
      <div className={styles.gameEntry}>
        <div className={styles.gameEntryTitle}>
          {leagueLogo ? (
            <img
              className={styles.leagueLogo}
              alt={leagueName}
              src={leagueLogo}
              title={leagueName}
            ></img>
          ) : (
            <div className={styles.leagueLogoPlaceholder} aria-hidden="true"></div>
          )}
          <div className={styles.titleBlock}>
            <div className={styles.titleText}>
              <h5>{gameTitle}</h5>
              {activeOwnCustomEvent && (
                <p className={styles.ownCustomOddsHint}>Your custom odd is live for this fixture.</p>
              )}
            </div>
            <div className={styles.gameEntryActions}>
              <button
                type="button"
                className={`${styles.customActionButton} ${styles.shareActionButton}`}
                onClick={shareFixture}
                aria-label={`Share ${gameTitle}`}
              >
                Share
              </button>
              {activeOwnCustomEvent ? (
                <button
                  type="button"
                  className={`${styles.customActionButton} ${styles.customActionButtonOwned}`}
                  onClick={openOwnModal}
                  aria-label={`Manage your custom odds for ${gameTitle}`}
                >
                  Your odd
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.customActionButton}
                  onClick={openCreateModal}
                  aria-label={`Create custom odds for ${gameTitle}`}
                  disabled={!canOpenCreateModal}
                  title={
                    !canCreateCustomOdds
                      ? "Please sign in before creating custom odds."
                      : !isFixtureNotStarted
                        ? "Custom odds can only be created before kickoff."
                        : undefined
                  }
                >
                  +
                </button>
              )}
              {customOddsCount > 0 && (
                <button
                  type="button"
                  className={`${styles.customActionButton} ${styles.customActionButtonAccent}`}
                  onClick={openBrowseModal}
                  aria-label={`View ${customOddsCount} custom odds posts for ${gameTitle}`}
                >
                  {`\u2192 ${customOddsCount}`}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className={styles.gameEntrySubTitle}>
          <span className={styles.gameDate}>{formattedEventDate}</span>
          {shareFeedback && <span className={styles.gameMetaFeedback}>{shareFeedback}</span>}
        </div>
        <div className={styles.gameEntryBody}>
          <div className={styles.gameOddButtonGroup}>
            <OddButton
              data={{
                eventId: id,
                title: "Home",
                odd: homeOdd,
                fixture,
                league,
                gameTitle,
              }}
            />
            <OddButton
              data={{
                eventId: id,
                title: "Draw",
                odd: drawOdd,
                fixture,
                league,
                gameTitle,
              }}
            />
            <OddButton
              data={{
                eventId: id,
                title: "Away",
                odd: awayOdd,
                fixture,
                league,
                gameTitle,
              }}
            />
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className={styles.modalOverlay} onClick={closeCreateModal}>
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Custom Odds</p>
                <h4>Create funded 1X2 odds</h4>
                <p className={styles.modalSummary}>{gameTitle}</p>
              </div>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={closeCreateModal}
              >
                x
              </button>
            </div>
            <p className={styles.modalInfo}>
              Reserve a pool fund up front so bettors can see how much maximum return this post can
              support before kickoff.
            </p>
            <form className={styles.customOddsForm} onSubmit={submitCustomOdds}>
              <label className={styles.formField}>
                <span>Home win odd</span>
                <input
                  type="number"
                  min="1.01"
                  step="0.01"
                  value={customOddForm.homeOdd}
                  onChange={(event) => updateField("homeOdd", event.target.value)}
                />
              </label>
              <label className={styles.formField}>
                <span>Draw odd</span>
                <input
                  type="number"
                  min="1.01"
                  step="0.01"
                  value={customOddForm.drawOdd}
                  onChange={(event) => updateField("drawOdd", event.target.value)}
                />
              </label>
              <label className={styles.formField}>
                <span>Away win odd</span>
                <input
                  type="number"
                  min="1.01"
                  step="0.01"
                  value={customOddForm.awayOdd}
                  onChange={(event) => updateField("awayOdd", event.target.value)}
                />
              </label>
              <label className={styles.formField}>
                <span>Reserved pool fund</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={customOddForm.poolFund}
                  onChange={(event) => updateField("poolFund", event.target.value)}
                />
              </label>
              {submitError && <p className={styles.formError}>{submitError}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={closeCreateModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post custom odds"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOwnModalOpen && activeOwnCustomEvent && (
        <div className={styles.modalOverlay} onClick={closeOwnModal}>
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Your Custom Odds</p>
                <h4>Manage funded 1X2 post</h4>
                <p className={styles.modalSummary}>{gameTitle}</p>
              </div>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={closeOwnModal}
              >
                x
              </button>
            </div>
            <div className={styles.ownEventMeta}>
              <span>Status: {activeOwnCustomEvent.status}</span>
              <span>Reserved pool {formatCurrency(activeOwnCustomEvent.pool_fund)}</span>
              <span>
                Remaining liability {formatCurrency(activeOwnCustomEvent.remaining_liability)}
              </span>
              <span>Live bets {activeOwnCustomEvent.bet_count || 0}</span>
              <span>
                Posted{" "}
                {new Date(activeOwnCustomEvent.create_date).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <article className={styles.customOddsCard}>
              <div className={styles.customOddsOptionRow}>
                {(activeOwnCustomEvent.odd_data?.options || []).map((option) => (
                  <div
                    key={`${activeOwnCustomEvent.id}-${option.result}`}
                    className={styles.customOddsOption}
                  >
                    <span>{option.label}</span>
                    <strong>{Number(option.odd).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </article>
            <div className={styles.marketStatsGrid}>
              <div className={styles.marketStat}>
                <span>Home max stake</span>
                <strong>{formatCurrency(getOptionMaxStake(activeOwnCustomEvent, 0))}</strong>
              </div>
              <div className={styles.marketStat}>
                <span>Draw max stake</span>
                <strong>{formatCurrency(getOptionMaxStake(activeOwnCustomEvent, 1))}</strong>
              </div>
              <div className={styles.marketStat}>
                <span>Away max stake</span>
                <strong>{formatCurrency(getOptionMaxStake(activeOwnCustomEvent, 2))}</strong>
              </div>
            </div>
            {Number(activeOwnCustomEvent.pool_fund || 0) <= 0 && (
              <p className={styles.emptyState}>
                This is a legacy zero-fund post. Top it up before other users can place bets.
              </p>
            )}
            {canFundOwnCustomOdd && (
              <form className={styles.inlineForm} onSubmit={submitTopUp}>
                <label className={styles.formField}>
                  <span>Top up reserved pool</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={fundAmount}
                    onChange={(event) => setFundAmount(event.target.value)}
                  />
                </label>
                <button type="submit" className={styles.primaryButton} disabled={isFunding}>
                  {isFunding ? "Funding..." : "Add funds"}
                </button>
              </form>
            )}
            {!canCancelOwnCustomOdd && (
              <p className={styles.emptyState}>
                This custom odd can only be canceled before kickoff and before any bets are linked.
              </p>
            )}
            {isConfirmingCancel && canCancelOwnCustomOdd && (
              <div className={styles.confirmPanel}>
                <p>
                  Canceling will hide this post from active community lists and refund the reserved
                  pool back to your wallet.
                </p>
              </div>
            )}
            {fundError && <p className={styles.formError}>{fundError}</p>}
            {cancelError && <p className={styles.formError}>{cancelError}</p>}
            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={closeOwnModal}>
                Close
              </button>
              {canCancelOwnCustomOdd && !isConfirmingCancel && (
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() => setIsConfirmingCancel(true)}
                >
                  Cancel custom odd
                </button>
              )}
              {canCancelOwnCustomOdd && isConfirmingCancel && (
                <>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setIsConfirmingCancel(false)}
                    disabled={isCanceling}
                  >
                    Keep live
                  </button>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={cancelOwnCustomOdds}
                    disabled={isCanceling}
                  >
                    {isCanceling ? "Canceling..." : "Confirm cancel"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isBrowseModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsBrowseModalOpen(false)}>
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Community Odds</p>
                <h4>Custom odds posts</h4>
                <p className={styles.modalSummary}>{gameTitle}</p>
              </div>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={() => setIsBrowseModalOpen(false)}
              >
                x
              </button>
            </div>
            <div className={styles.customOddsList}>
              {customOddsList.length === 0 ? (
                <p className={styles.emptyState}>No custom odds are available for this game.</p>
              ) : (
                customOddsList.map((customEvent) => {
                  const availabilityMessage = getEventAvailabilityMessage(
                    customEvent,
                    isFixtureNotStarted
                  );

                  return (
                    <article key={customEvent.id} className={styles.customOddsCard}>
                      <div className={styles.customOddsCardHeader}>
                        <strong>{customEvent.created_by}</strong>
                        <span>
                          {new Date(customEvent.create_date).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className={styles.eventMetaGrid}>
                        <span>Reserved {formatCurrency(customEvent.pool_fund)}</span>
                        <span>
                          Remaining {formatCurrency(customEvent.remaining_liability)}
                        </span>
                        <span>Bets {customEvent.bet_count || 0}</span>
                      </div>
                      <div className={styles.customOddsOptionRow}>
                        {(customEvent.odd_data?.options || []).map((option) => (
                          <div key={`${customEvent.id}-${option.result}`} className={styles.optionBetCard}>
                            <div className={styles.optionBetHeader}>
                              <span>{option.label}</span>
                              <strong>{Number(option.odd).toFixed(2)}</strong>
                            </div>
                            <p className={styles.optionBetMeta}>
                              Max stake {formatCurrency(getOptionMaxStake(customEvent, option.result))}
                            </p>
                            <button
                              type="button"
                              className={styles.primaryButton}
                              onClick={() => openBetModal(customEvent, option)}
                              disabled={
                                !!availabilityMessage ||
                                getOptionMaxStake(customEvent, option.result) <= 0
                              }
                            >
                              Bet this outcome
                            </button>
                          </div>
                        ))}
                      </div>
                      {availabilityMessage && (
                        <p className={styles.emptyState}>{availabilityMessage}</p>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeBetDraft && (
        <div className={styles.modalOverlay} onClick={closeBetModal}>
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Place Custom Bet</p>
                <h4>
                  {activeBetDraft.option.label} @ {Number(activeBetDraft.option.odd).toFixed(2)}
                </h4>
                <p className={styles.modalSummary}>
                  {gameTitle} | Posted by {activeBetDraft.customEvent.created_by}
                </p>
              </div>
              <button type="button" className={styles.modalCloseButton} onClick={closeBetModal}>
                x
              </button>
            </div>
            <p className={styles.modalInfo}>
              Standalone custom bets stay outside the normal slip. Your maximum stake on this
              outcome is {formatCurrency(activeBetMaxStake)}.
            </p>
            <form className={styles.customOddsForm} onSubmit={placeCustomBet}>
              <label className={styles.formField}>
                <span>Stake</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={betStake}
                  onChange={(event) => setBetStake(event.target.value)}
                />
              </label>
              <div className={styles.marketStatsGrid}>
                <div className={styles.marketStat}>
                  <span>Potential return</span>
                  <strong>
                    {formatCurrency((parseFloat(betStake) || 0) * Number(activeBetDraft.option.odd))}
                  </strong>
                </div>
                <div className={styles.marketStat}>
                  <span>Remaining liability</span>
                  <strong>{formatCurrency(activeBetDraft.customEvent.remaining_liability)}</strong>
                </div>
              </div>
              {betError && <p className={styles.formError}>{betError}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={closeBetModal}>
                  Close
                </button>
                <button type="submit" className={styles.primaryButton} disabled={isBetting}>
                  {isBetting ? "Placing..." : "Place custom bet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default GameEntry;
