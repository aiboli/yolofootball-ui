import { useState } from "react";
import OddButton from "../Basic/OddButton";
import { getCookie } from "../../helper/cookieHelper";
import styles from "./GameEntry.module.css";

function GameEntry({
  id,
  home,
  away,
  odd,
  fixture,
  league,
  customEvents = [],
  canCreateCustomOdds,
  onCustomOddsCreated,
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [customOddForm, setCustomOddForm] = useState({
    homeOdd: "",
    drawOdd: "",
    awayOdd: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventDate = fixture.date;
  const leagueName = league.name;
  const leagueLogo = league.logo;
  const oddsContent = odd.bets[0]?.values;
  const homeOdd = oddsContent[0]?.odd;
  const drawOdd = oddsContent[1]?.odd;
  const awayOdd = oddsContent[2]?.odd;
  const gameTitle = `${home} vs ${away}`;
  const customOddsCount = customEvents.length;

  const formattedEventDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSubmitError("");
    setCustomOddForm({
      homeOdd: "",
      drawOdd: "",
      awayOdd: "",
    });
  };

  const openCreateModal = () => {
    if (!canCreateCustomOdds) {
      alert("Please sign in before creating custom odds.");
      return;
    }

    setSubmitError("");
    setIsCreateModalOpen(true);
  };

  const openBrowseModal = () => {
    setIsBrowseModalOpen(true);
  };

  const updateField = (fieldName, value) => {
    setCustomOddForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  };

  const submitCustomOdds = async (event) => {
    event.preventDefault();

    const numericOdds = [
      parseFloat(customOddForm.homeOdd),
      parseFloat(customOddForm.drawOdd),
      parseFloat(customOddForm.awayOdd),
    ];
    if (!numericOdds.every((oddValue) => Number.isFinite(oddValue) && oddValue > 0)) {
      setSubmitError("Please enter odds greater than 0 for Home, Draw, and Away.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("https://service.yolofootball.com/api/events", {
        method: "POST",
        body: JSON.stringify({
          fixture_id: id,
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
          authorization: `${getCookie("access_token")}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.message || "Unable to post custom odds.");
        return;
      }

      closeCreateModal();
      if (onCustomOddsCreated) {
        await onCustomOddsCreated();
      }
      alert("Custom odds posted successfully.");
    } catch (error) {
      setSubmitError("Unable to post custom odds.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.gameEntry}>
        <div className={styles.gameEntryTitle}>
          <img
            className={styles.leagueLogo}
            alt={leagueName}
            src={leagueLogo}
            title={leagueName}
          ></img>
          <div className={styles.titleBlock}>
            <h5>{gameTitle}</h5>
            <div className={styles.gameEntryActions}>
              <button
                type="button"
                className={styles.customActionButton}
                onClick={openCreateModal}
                aria-label={`Create custom odds for ${gameTitle}`}
              >
                +
              </button>
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
                <h4>Create 1X2 odds</h4>
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
            <form className={styles.customOddsForm} onSubmit={submitCustomOdds}>
              <label className={styles.formField}>
                <span>Home win odd</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={customOddForm.homeOdd}
                  onChange={(event) => updateField("homeOdd", event.target.value)}
                />
              </label>
              <label className={styles.formField}>
                <span>Draw odd</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={customOddForm.drawOdd}
                  onChange={(event) => updateField("drawOdd", event.target.value)}
                />
              </label>
              <label className={styles.formField}>
                <span>Away win odd</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={customOddForm.awayOdd}
                  onChange={(event) => updateField("awayOdd", event.target.value)}
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
              {customEvents.length === 0 ? (
                <p className={styles.emptyState}>No custom odds are available for this game.</p>
              ) : (
                customEvents.map((customEvent) => (
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
                    <div className={styles.customOddsOptionRow}>
                      {(customEvent.odd_data?.options || []).map((option) => (
                        <div key={`${customEvent.id}-${option.result}`} className={styles.customOddsOption}>
                          <span>{option.label}</span>
                          <strong>{Number(option.odd).toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GameEntry;
