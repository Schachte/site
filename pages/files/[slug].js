import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
const hljs = require("highlight.js");
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

import { useEffect } from 'react'

import "../../node_modules/highlight.js/styles/nord.css";

export default function PostPage({
  frontmatter: { title, date },
  slug,
  content,
}) {

  useEffect(() => {
    hljs.initHighlighting();
}, []);

  return (
    <>
      <div className="blog_post">
        <div className="post_header">
          <div className="post_title">{title}</div>
          <div className="post_date">{date}</div>
        </div>
        <div
          className="post_body"
          dangerouslySetInnerHTML={{ __html: marked(content) }}
        ></div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(path.join("posts"));
  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace(".md", ""),
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const markdownWithMeta = fs.readFileSync(path.join("posts", slug + ".md"));
  const { data: frontmatter, content } = matter(markdownWithMeta);

  marked.setOptions({
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    },
  });

  return {
    props: {
      frontmatter,
      slug,
      content,
    },
  };
}
