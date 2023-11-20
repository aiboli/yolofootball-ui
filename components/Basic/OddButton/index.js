import styles from "./OddButton.module.css";

function OddButton({ data }) {
  return (
    <button className={styles.oddButton}>
      <span className={styles.oddTitle}>{data.title}</span>
      <br />
      <span className={styles.oddNumber}>{data.odd}</span>
    </button>
  );
}

export default OddButton;
