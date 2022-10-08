import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import List from "../components/List.js";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export default function Home({ posts }) {
  return (
    <>
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
