import React from "react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import light from "react-syntax-highlighter/dist/cjs/styles/prism/nord";
import Image from "next/future/image";
import styles from "../styles/Post.module.scss";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CodeBlock = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={light}
        language={"javascript"}
        PreTag="div"
        showLineNumbers={true}
        customStyle={{ margin: 0, padding: ".5rem", fontSize: ".8rem" }}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  p: ({ node, children }) => {
    if (node.children[0].tagName === "img") {
      const image = node.children[0].properties.src;
      return (
        <div
          style={{
            width: "auto",
            height: "100%",
            position: "relative",
          }}
        >
          <Link href={image}>
            <span className={styles["img-enlarge"]}>Click to enlarge</span>
          </Link>
          <Link href={image}>
            <Image
              src={image}
              className={styles["img-styles"]}
              width="0"
              height="0"
              alt={"img"}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
            />
          </Link>
        </div>
      );
    }
    // return a standard paragraph in all other cases
    else return <p>{children}</p>;
  },

  pre: (props) => {
    const className = props.children[0].props?.className?.split("-")[1];
    const contents = props.children[0].props.children[0];

    return (
      <pre style={{ position: "relative" }}>
        <div className={styles["code-tag"]}>
          <span>language: {className}</span>
          <div className={styles["copy"]}>
            <CopyToClipboard text={contents}>
              <FontAwesomeIcon icon={faCopy} />
            </CopyToClipboard>
          </div>
        </div>
        {props.children}
      </pre>
    );
  },
};

export { CodeBlock };
