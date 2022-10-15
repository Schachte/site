import Link from "next/link";
import styles from '../styles/Header.module.scss'

export default function Header({ toggleTheme }) {

  return (
    <header className={styles["header"]}>
      <div className={styles["logo"]}>
        <Link href="/">
          <div className={styles["logo"]}>
            <h1>👾 Ryan Schachte</h1>
          </div>
        </Link>
      </div>

      <div className={styles["navigation"]}>
        <Link href="/">
          <div>Home</div>
        </Link>
        <Link href="/about">
          <div>About</div>
        </Link>
        <div>
          <a href="https://youtube.com/thesimpleengineer">Videos</a>
        </div>
        <div>
          <a href="mailto:code@ryan-schachte.com">Contact</a>
        </div>
        <div onClick={toggleTheme}>
          🌙
        </div>
      </div>
    </header>
  );
}
