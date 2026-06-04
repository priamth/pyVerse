import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
  "cyberpunk",
  "terminal",
  "modern",
  "synthwave",
  "amber",
  "ocean",
];

const DEFAULTS = {
  theme: "cyberpunk",
  reduceMotion: false,
  compact: false,
  fontSize: "normal", // small | normal | large
  density: "normal", // compact | normal | spacious
  glow: "high", // off | low | high
  showClickCount: true,
  showPopularity: true,
  showCategoryStrip: true,
  showScanlines: "auto", // auto | on | off
  cardHover: "lift", // lift | glow | none
  defaultSort: "relevance",
  defaultCategory: "all",
  showHeroStats: true,
  chaosMode: false,
  easterEggs: true,
  highContrast: false,
  showAltUsesPreview: false,
};

const KEYS = Object.fromEntries(
  Object.keys(DEFAULTS).map((k) => [k, `gv_${k.replace(/([A-Z])/g, "_$1").toLowerCase()}`]),
);

function loadState() {
  const out = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) {
    try {
      const raw = localStorage.getItem(KEYS[k]);
      if (raw === null) continue;
      if (typeof DEFAULTS[k] === "boolean") out[k] = raw === "1";
      else out[k] = raw;
    } catch {
      // ignore
    }
  }
  return out;
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [state, setState] = useState(loadState);

  // Persist + apply to <html>
  useEffect(() => {
    const html = document.documentElement;

    // Chaos mode: pick random theme per session (but never persist the random)
    let themeToApply = state.theme;
    if (state.chaosMode) {
      const sessionTheme = sessionStorage.getItem("gv_chaos_theme");
      if (sessionTheme && THEMES.includes(sessionTheme)) {
        themeToApply = sessionTheme;
      } else {
        themeToApply = THEMES[Math.floor(Math.random() * THEMES.length)];
        sessionStorage.setItem("gv_chaos_theme", themeToApply);
      }
    }

    html.dataset.theme = themeToApply;
    html.dataset.reduceMotion = state.reduceMotion ? "1" : "0";
    html.dataset.compact = state.compact || state.density === "compact" ? "1" : "0";
    html.dataset.density = state.density;
    html.dataset.fontSize = state.fontSize;
    html.dataset.glow = state.glow;
    html.dataset.cardHover = state.cardHover;
    html.dataset.scanlines = state.showScanlines;
    html.dataset.highContrast = state.highContrast ? "1" : "0";

    for (const k of Object.keys(DEFAULTS)) {
      try {
        const v = state[k];
        if (typeof v === "boolean") localStorage.setItem(KEYS[k], v ? "1" : "0");
        else localStorage.setItem(KEYS[k], String(v));
      } catch {
        // ignore
      }
    }
  }, [state]);

  const set = (key) => (value) => setState((s) => ({ ...s, [key]: value }));
  const reset = () => {
    sessionStorage.removeItem("gv_chaos_theme");
    setState(DEFAULTS);
  };

  return (
    <ThemeContext.Provider
      value={{
        ...state,
        themes: THEMES,
        setTheme: set("theme"),
        setReduceMotion: set("reduceMotion"),
        setCompact: set("compact"),
        setFontSize: set("fontSize"),
        setDensity: set("density"),
        setGlow: set("glow"),
        setShowClickCount: set("showClickCount"),
        setShowPopularity: set("showPopularity"),
        setShowCategoryStrip: set("showCategoryStrip"),
        setShowScanlines: set("showScanlines"),
        setCardHover: set("cardHover"),
        setDefaultSort: set("defaultSort"),
        setDefaultCategory: set("defaultCategory"),
        setShowHeroStats: set("showHeroStats"),
        setChaosMode: set("chaosMode"),
        setEasterEggs: set("easterEggs"),
        setHighContrast: set("highContrast"),
        setShowAltUsesPreview: set("showAltUsesPreview"),
        reset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
