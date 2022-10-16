import styles from '../styles/Post.module.scss'
import AboutStyles from '../styles/About.module.scss'

import Experience from "../utils/experience.json"
import Projects from "../utils/projects.json"
import { faTwitter, faGithub, faYoutube } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default function AboutPage() {
  return (
    <>
      <div className={styles["blog_post"]}>
        <div className={styles["post_header"]}>
          <div className={styles["post_title"]} style={{ borderBottom: "5px solid var(--link-hover)", paddingBottom: "10px" }}>About</div>
        </div>
        <div className={styles["post_body"]}>
          <p>
            👋, I&#39;m Ryan Schachte. I&#39;m a computer systems engineer at{" "}
            <u>
              <a href="https://cloudflare.com">Cloudflare</a>
            </u>{" "}
            working on video stuff. I love learning, teaching and programming.
            You can check out some of my past talks and videos over at{" "}
            <u>
              <a href="https://youtube.com/thesimpleengineer">Youtube.</a>
            </u>
          </p>

          <p>
            This is my blog where I post about random thoughts, code snippets,
            technology or low-level stuff. I live in Santa Barbara, CA. If you ever want to grab a coffee, drop me a <u><a href="mailto:code@ryan-schachte.com">note!</a></u>
          </p>
        </div>

        <div className={styles["post_body"]}>
          <div className={styles["post_header"]}>
            <div className={styles["post_title"]} style={{ borderBottom: "5px solid var(--link-hover)", paddingBottom: "10px" }}>Experience</div>

            <div className={AboutStyles["jobs"]}>
              {Experience.map(job => {
                const { company, title, time, description, logo } = job
                return (
                  <div key={title} className={AboutStyles["job-entry"]}>
                    <div className={AboutStyles["company-container"]}>
                      <img src={`/images/company_logos/${logo}`} />
                      <span className={AboutStyles["job-entry__company"]}>{company}</span>
                    </div>
                    <span className={AboutStyles["job-entry__title"]}>{title}</span>
                    <span className={AboutStyles["job-entry__time"]}>{time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles["post_body"]}>
          <div className={styles["post_header"]}>
            <div className={styles["post_title"]} style={{ borderBottom: "5px solid var(--link-hover)", paddingBottom: "10px" }}>Projects</div>
            <div className={AboutStyles["jobs"]}>
              {Projects.map(project => {
                const { title, description, link } = project
                return (
                  <a href={link} key={title} target="_blank" rel="noreferrer">
                    <div className={AboutStyles["project-entry"]}>
                      <div className={AboutStyles["project-container"]}>
                        <span className={AboutStyles["project_name"]}>{title}</span>
                        <a className={AboutStyles["github"]} href={link} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faGithub} /></a>
                      </div>
                      <span className={AboutStyles["project_description"]}>{description}</span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
