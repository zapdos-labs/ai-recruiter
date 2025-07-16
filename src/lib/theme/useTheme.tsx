import { createEffect, onMount } from "solid-js";
import { parseCookie } from "../cookie";
import { setTheme, theme } from "./theme";

export default function useTheme() {
  onMount(() => {
    const cookie = document.cookie || "";
    const theme = parseCookie("theme", cookie);
    if (theme === "dark") {
      setTheme("dark");
      return;
    }
    setTheme("light");
  });

  createEffect(() => {
    const t = theme();
    if (t == "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
      document.cookie = "theme=dark; max-age=3600; path=/";
      return;
    }
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    document.cookie = "theme=light; max-age=3600; path=/";
  });

  return {
    theme,
    setTheme,
    toggleTheme: () => {
      setTheme((t) => (t === "dark" ? "light" : "dark"));
    },
  };
}
