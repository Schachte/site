import React from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import dynamic from "next/dynamic";
import dark from 'react-syntax-highlighter/dist/cjs/styles/prism/duotone-earth'
import light from 'react-syntax-highlighter/dist/cjs/styles/prism/duotone-light'

const CodeBlockDark = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");

    return !inline && match ? (
      <SyntaxHighlighter
        style={dark}
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
};

const CodeBlockLight = {
  code({ node, inline, className, children, ...props }) {
    console.log('light')

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
};

export { CodeBlockLight, CodeBlockDark };
