import React, { createContext, useState, useContext } from "react";
import { sendTheme } from "@/services/auth";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider ({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme") as Theme || "light";
        document.documentElement.classList.toggle('dark', saved === "dark");
        return saved;
    });

    async function toggleTheme() {
        const next = theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", next);
        document.documentElement.classList.toggle('dark', next === "dark");
        setTheme(next);
        await sendTheme(next);
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