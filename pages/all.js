import fs from "fs";
import path from "path";
import matter from "gray-matter";
import styles from '../styles/All.module.scss'
import React from 'react';
import Link from "next/link";


export default function PostPage({ years }) {
    const sortedYears = Object.keys(years).map(year => year)
    sortedYears.sort().reverse()
    return (
        <div className={styles["all-container"]}>
            <h1 className={styles["h1"]}>All Posts</h1>
            {sortedYears.map(year => {
                return (
                    <React.Fragment key={year}>
                        <span key={year} className={styles["year"]}>{year}</span>
                        {years[year].map(post => {
                            return (
                                <Link key={post.title} href={`/files/${post.link}`}>
                                    <div className={styles["entry"]}>
                                        <span className={styles["entry-date"]}>{post.date}</span>
                                        <span className={styles["entry-title"]}>{post.title}</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </React.Fragment>
                )
            })}
        </div>
    );
}

export async function getStaticProps() {
    const files = fs.readdirSync(path.join("posts"));
    const posts = files.map((filename) => {
        const slug = filename.replace(".md", "");
        const { data: meta } = matter(
            fs.readFileSync(path.join("posts", filename), "utf-8")
        );
        return {
            slug,
            meta,
        };
    });

    const years = {}
    posts.map((post) => {
        const currentYear = parseInt(post.meta.date.split(' ')[2])
        const currentPostsForYear = years[currentYear] || []
        years[currentYear] = [{
            title: post.meta.title,
            link: post.slug,
            date: post.meta.date
        }, ...currentPostsForYear]
    })

    for (const [key, value] of Object.entries(years)) {
        value.sort(function (a, b) {
            var keyA = new Date(Date.parse(a.date)),
                keyB = new Date(Date.parse(b.date));

            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
        });
    }

    return {
        props: {
            years,
        },
    };
}

