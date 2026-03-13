import React, { createContext, useState, useContext } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider ({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(
        localStorage.getItem("theme") as Theme || "light"
    );

    function toggleTheme() {
        setTheme(prev => {
            const next = prev === "light" ? "dark" : "light";
            localStorage.setItem("theme", next);
            console.log('Theme set to '+next);
            return next;
        });
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const themeContext = useContext(ThemeContext);
    if (!themeContext) throw new Error("useTheme must be used inside ThemeProvider");
    return themeContext;
}