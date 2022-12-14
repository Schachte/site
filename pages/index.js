import fs from "fs";

import styles from '../styles/Header.module.scss'

import List from "../components/List.js";
import Welcome from "../components/Welcome.js";

import Link from "next/link";
import path from "path";
import matter from "gray-matter";
import Head from 'next/head';

export default function Home({ posts }) {

  return (
    <>
      <Head>
        <title>
          Ryan Schachte&#39;s Blog
        </title>
        <meta
          name="description"
          content="Ryan Schachte is a systems programmer at Cloudflare who writes and creates videos about software engineering, low-level programming, mathematics and algorithms."
          key="desc"
        />
        <meta
          property="og:image"
          content="https://ryan-schachte.com/images/face.jpg"
        />
      </Head>
      <Welcome />
      <div className={styles["post-header"]}>
        <h1>Latest Articles</h1>
        <Link href="/all">View all</Link>
      </div>
      <List posts={posts} />
    </>
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
  return {
    props: {
      posts,
    },
  };
}