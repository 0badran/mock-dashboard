import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "@/i18n";
import { DirectionProvider } from "@/components/ui/direction";

type Theme = "light" | "dark";
type Direction = "ltr" | "rtl";
export type UserRole = "admin" | "client";

interface ThemeContextType {
  theme: Theme;
  direction: Direction;
  language: string;
  role: UserRole;
  setTheme: (theme: Theme) => void;
  setDirection: (direction: Direction) => void;
  setLanguage: (lang: "ar" | "en") => void;
  setRole: (role: UserRole) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || "light";
    }
    return "light";
  });

  const [language, setLanguageState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("i18nextLng");
      return stored?.startsWith("en") ? "en" : "ar";
    }
    return "ar";
  });

  const [direction, setDirection] = useState<Direction>(() => {
    return language === "ar" ? "rtl" : "ltr";
  });

  const [role, setRole] = useState<UserRole>("admin");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    localStorage.setItem("direction", direction);
    localStorage.setItem("i18nextLng", language);
    i18n.changeLanguage(language);
  }, [direction, language]);

  const setLanguage = (lang: "ar" | "en") => {
    setLanguageState(lang);
    setDirection(lang === "ar" ? "rtl" : "ltr");
  };

  const toggleLanguage = () => {
    const next = language === "ar" ? "en" : "ar";
    setLanguage(next);
  };

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider
      value={{
        theme,
        direction,
        language,
        role,
        setTheme,
        setDirection,
        setLanguage,
        setRole,
        toggleTheme,
        toggleLanguage,
      }}
    >
      <DirectionProvider dir={direction}>
        {children}
      </DirectionProvider>
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
