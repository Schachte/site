import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import light from 'react-syntax-highlighter/dist/cjs/styles/prism/nord'
import Image from 'next/image'
import styles from "../styles/Post.module.scss"
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


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

  pre: (props) => {
    const className = props.children[0].props.className.split("-")[1]
    const contents = props.children[0].props.children[0]

    const [copy, setCopy] = useState(false)

    const copied = () => {
      setCopy(true)
      setTimeout(function(){setCopy(false)}, 3000);
    }

    return (
      <pre style={{ position: 'relative' }}>
        <div className={styles["code-tag"]}>
          <span>language: {className}</span>
          <div className={styles["copy"]}>
            {copy && <span>Copied</span>}
            <CopyToClipboard text={contents} onCopy={copied}>
              <FontAwesomeIcon icon={faCopy} />
            </CopyToClipboard>
          </div>
        </div>
        {props.children}
      </pre>
    )
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
