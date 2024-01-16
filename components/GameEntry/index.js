import OddButton from "../Basic/OddButton";
import styles from "./GameEntry.module.css";

function GameEntry({ id, home, away, odd, date, fixture, league }) {
  const eventDate = fixture.date;
  const leagueName = league.name;
  const leagueLogo = league.logo;
  const oddsContent = odd.bets[0]?.values;
  const homeOdd = oddsContent[0]?.odd;
  const drawOdd = oddsContent[1]?.odd;
  const awayOdd = oddsContent[2]?.odd;
  const gameTitle = `${home} vs ${away}`;
  return (
    <div className={styles.gameEntry}>
      <div className={styles.gameEntryTitle}>
        <img
          className={styles.leagueLogo}
          alt={leagueName}
          src={leagueLogo}
          title={leagueName}
        ></img>
        <h5>{gameTitle}</h5>
      </div>
      <div className={styles.gameEntrySubTitle}>
        <span className={styles.gameDate}>
          {new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
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
  );
}

export default GameEntry;
