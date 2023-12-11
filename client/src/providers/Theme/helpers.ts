import type { Theme } from "./types";

function getSystemTheme(): Theme.Value {
    if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    ) return 'dark';
    return 'light';
}

function applyTheme(theme: Theme.Value): void {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
}

export { getSystemTheme, applyTheme };
