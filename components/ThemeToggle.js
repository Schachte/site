import { useState, useEffect } from "react";

const ThemeToggle = () => {
    const [activeTheme, setActiveTheme] = useState(document.body.dataset.theme);
    const inactiveTheme = activeTheme === "light" ? "dark" : "light";

    useEffect(() => {
        document.body.dataset.theme = activeTheme;
        window.localStorage.setItem("theme", activeTheme);
    }, [activeTheme]);

    return (
        <div onClick={() => setActiveTheme(inactiveTheme)}>
            🌙
        </div>
    );
};

export default ThemeToggle;