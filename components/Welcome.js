import styles from '../styles/Welcome.module.scss'

import {faEnvelope} from '@fortawesome/free-solid-svg-icons'
import { faTwitter ,faGithub, faYoutube } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Welcome() {
  return (
    <section className={styles["welcome"]}>
      <p>Just a playground for my thoughts.</p>
      <div className={styles["social"]}>
        <a href="https://github.com/schachte" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faGithub} /></a>
        <a href="https://twitter.com/ryanschachte" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faTwitter} /></a>
        <a href="https://youtube.com/thesimpleengineer" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faYoutube} /></a>
        <a href="mailto:code@ryan-schachte.com"><FontAwesomeIcon icon={faEnvelope} /></a>
      </div>
    </section>
  );
}
