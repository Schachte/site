import Link from 'next/link'
import styles from '../styles/Posts.module.scss'

export default function List({ posts }) {
    return (
        <section className={styles["posts"]}>
            {posts.map(({ meta: post, slug }) => {
                return (
                    <Link key={slug} href={`/files/${slug}`}>
                        <div className={styles["post"]}>
                            <span className={styles["date"]}>{post.date}</span>
                            <span className={styles["title"]}>{post.title}</span>
                        </div>
                    </Link>
                )
            })}
        </section>
    )
}