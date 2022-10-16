
import '../styles/globals.css'
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const DynamicHeader = dynamic(() => import("../components/Header"), {
  ssr: false,
});

function Blog({ Component, pageProps }) {
  return (
    <div className={"container main"}>
      <DynamicHeader />
      <Component {...pageProps} />
    </div>
  )
}

export default Blog