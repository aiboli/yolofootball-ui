import styles from  './homepage.module.css';
import Head from 'next/head';

function Home() {
    return (
        <>
        <Head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Poor+Story" rel="stylesheet" />
        </Head>
        <div className={styles.header}><h2>Yolofootball</h2></div>
        <div className={styles.content}>
            <div className={styles.leagues}>left section</div>
            <div className={styles.games}>center dashboard</div>
            <div className={styles.dashboard}>right section</div>
        </div>
        <div className={styles.footer}>footer</div>
        </>
        )
}

export default Home;
