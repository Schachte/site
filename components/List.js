import Link from 'next/link'
import styles from '../styles/Posts.module.scss'

export default function List({ posts }) {
    const sortedPosts = posts.sort(function (a, b) {
        var keyA = new Date(Date.parse(a.meta.date)),
            keyB = new Date(Date.parse(b.meta.date));
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });

    return (
        <section className={styles["posts"]}>
            {sortedPosts.map(({ meta: post, slug }) => {
                var loadDrafts = (process.env.NEXT_PUBLIC_LOAD_DRAFTS === 'true');
                if (post.mode != 'draft' || loadDrafts) {
                    return (
                        <Link key={slug} href={`/files/${slug}`}>
                            <div className={styles["post"]}>
                                <span className={styles["date"]}>{post.date}</span>
                                <span className={styles["title"]}>{post.title}</span>
                            </div>
                        </Link>
                    )
                }
            })}
        </section>
    )
}