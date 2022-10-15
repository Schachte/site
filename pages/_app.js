
import '../styles/globals.css'
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const DynamicHeader = dynamic(() => import("../components/Header"), {
  ssr: false,
});


function Blog({ Component, pageProps }) {

  const [theme, setTheme] = useState('');

  // sync the changed theme value to local storage and body data attribute
  useEffect(() => {
    if (window.localStorage.getItem("theme") != undefined) {
      document.body.dataset.theme = window.localStorage.getItem("theme");
      setTheme(window.localStorage.getItem("theme"))
      return
    } 

    if (window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        window.localStorage.setItem("theme", 'dark');
        document.body.dataset.theme = theme;
        setTheme('dark')
      } else {
        window.localStorage.setItem("theme", 'light');
        document.body.dataset.theme = theme;
        setTheme('light')
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log('them')
    if (theme === 'dark') {
      setTheme('light')
      return
    }
    setTheme('dark')
  };

  return (
    <div className={"container main"}>
      <DynamicHeader toggleTheme={toggleTheme} />
      <Component theme={theme} {...pageProps} />
    </div>
  )
}

export default Blog
