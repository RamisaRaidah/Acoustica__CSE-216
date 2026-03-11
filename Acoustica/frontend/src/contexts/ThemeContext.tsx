import React from "react";
import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider ({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");

    const 
}