import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import light from 'react-syntax-highlighter/dist/cjs/styles/prism/nord'

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
};

export { CodeBlock };
