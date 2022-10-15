import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { CodeBlockLight, CodeBlockDark } from "../../components/CodeBlock";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript'
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss'
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash'
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown'
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json'
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript'

import styles from '../../styles/Post.module.scss'

SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('scss', scss)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('markdown', markdown)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('javascript', javascript)

export default function PostPage({
  frontmatter: { title, date, tags },
  slug,
  theme,
  content,
}) {

  const tagList = tags.split(",")
  return (
    <>
      <div className={styles["blog_post"]}>
        <div className={styles["post_header"]}>
          <div className={styles["post_title"]}>{title}</div>
          <div className={styles["post_date"]}>By Ryan Schachte on {date}</div>
          <div className={styles["tags"]}>
            {tagList.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
        <div className={styles["post_body"]}>
          {theme === 'dark' ? <ReactMarkdown components={CodeBlockDark}>{content}</ReactMarkdown> : 
          <ReactMarkdown components={CodeBlockLight}>{content}</ReactMarkdown>}
        </div>
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

  return {
    props: {
      frontmatter,
      slug,
      content,
    },
  };
}
