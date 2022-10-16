import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import light from 'react-syntax-highlighter/dist/cjs/styles/prism/nord'
import Image from 'next/image'
import styles from "../styles/Post.module.scss"

const CodeBlock = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");

    return !inline && match ? (
      <SyntaxHighlighter
        style={light}
        language={"javascript"}
        PreTag="div"
        showLineNumbers={true}
        customStyle={{ margin: 0, padding: ".8rem" }}
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

  img: ({ src }) => {
    return (
      <Image
        src={src}
        width={3000}
        height={1800}
        objectFit={"contain"}
      />
    )
  }
};

export { CodeBlock };
