
import '../styles/globals.css'
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const DynamicHeader = dynamic(() => import("../components/Header"), {
  ssr: false,
});

function Blog({ Component, pageProps }) {
  // const [theme, setActiveTheme] = useState(document.body.dataset.theme);
  // const inactiveTheme = theme === "light" ? "dark" : "light";

  // useEffect(() => {
  //   document.body.dataset.theme = theme;
  //   window.localStorage.setItem("theme", theme);
  // }, [theme]);

  const theme = "light"
  return (
    <div className={"container main"}>
      <DynamicHeader toggleTheme={() => console.log("hi")} />
      <Component theme={theme} {...pageProps} />
    </div>
  )
}

export default Blog