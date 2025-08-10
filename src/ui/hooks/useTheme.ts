import { useEffect, useState } from "react";

// check if system has dark mode or light mode
const isSystemDarkMode = () => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return true;
    else return false;
};

// represents all the theme settings
export interface Theme {
    backgroundColor: string;
    foregroundColor: string;
    cardColor: string;
    cardForegroundColor: string;
    popoverColor: string;
    popoverForegroundColor: string;
    primaryColor: string;
    primaryForegroundColor: string;
    secondaryColor: string;
    secondaryForegroundColor: string;
    mutedColor: string;
    mutedForegroundColor: string;
    accentColor: string;
    accentForegroundColor: string;
    destructiveColor: string;
    destructiveForegroundColor: string;
    borderColor: string;
    inputColor: string;
    ringColor: string;
    radius: string;
    outputToplevel: string;
    outputError: string;
}

// applies theme by updating root css variables
const applyTheme = (theme: Theme) => {
    let themeStyle = document.querySelector("#theme");

    // if the style block doesn't exist, create it
    if (!themeStyle) {
        themeStyle = document.createElement("style");
        themeStyle.id = "theme";
        document.head.appendChild(themeStyle);
    }

    themeStyle.textContent = `
        :root {
        --background: ${theme.backgroundColor};
        --foreground: ${theme.foregroundColor};
        --card: ${theme.cardColor};
        --card-foreground: ${theme.cardForegroundColor};
        --popover: ${theme.popoverColor};
        --popover-foreground: ${theme.popoverForegroundColor};
        --primary: ${theme.primaryColor};
        --primary-foreground: ${theme.primaryForegroundColor};
        --secondary: ${theme.secondaryColor};
        --secondary-foreground: ${theme.secondaryForegroundColor};
        --muted: ${theme.mutedColor};
        --muted-foreground: ${theme.mutedForegroundColor};
        --accent: ${theme.accentColor};
        --accent-foreground: ${theme.accentForegroundColor};
        --destructive: ${theme.destructiveColor};
        --destructive-foreground: ${theme.destructiveForegroundColor};
        --border: ${theme.borderColor};
        --input: ${theme.inputColor};
        --ring: ${theme.ringColor};
        --radius: ${theme.radius};
        --outputToplevel: ${theme.outputToplevel};
        --outputError: ${theme.outputError};
        }`;
};

export const defaultDarkTheme: Theme = {
    backgroundColor: "0 0% 10%",
    foregroundColor: "0 0% 98%",
    cardColor: "0 0% 3.9%",
    cardForegroundColor: "0 0% 98%",
    popoverColor: "0 0% 3.9%",
    popoverForegroundColor: "0 0% 98%",
    primaryColor: "0 0% 98%",
    primaryForegroundColor: "0 0% 9%",
    secondaryColor: "0 0% 14.9%",
    secondaryForegroundColor: "0 0% 98%",
    mutedColor: "0 0% 14.9%",
    mutedForegroundColor: "0 0% 63.9%",
    accentColor: "0 0% 14.9%",
    accentForegroundColor: "0 0% 98%",
    destructiveColor: "0 62.8% 30.6%",
    destructiveForegroundColor: "0 0% 98%",
    borderColor: "0 0% 35%",
    inputColor: "0 0% 14.9%",
    ringColor: "0 0% 83.1%",
    radius: "5px",
    outputToplevel: "144 100% 39%",
    outputError: "357 96% 58%",
};

// --background: 0 0% 10%;
// --foreground: 0 0% 98%;
// --card: 0 0% 3.9%;
// --card-foreground: 0 0% 98%;
// --popover: 0 0% 3.9%;
// --popover-foreground: 0 0% 98%;
// --primary: 0 0% 98%;
// --primary-foreground: 0 0% 9%;
// --secondary: 0 0% 14.9%;
// --secondary-foreground: 0 0% 98%;
// --tertiary: 0 0% 20%;
// --tertiary-foreground: 0 0% 98%;
// --muted: 0 0% 14.9%;
// --muted-foreground: 0 0% 63.9%;
// --accent: 0 0% 14.9%;
// --accent-foreground: 0 0% 98%;
// --destructive: 0 62.8% 30.6%;
// --destructive-foreground: 0 0% 98%;
// --border: 0 0% 35%;
// --input: 0 0% 14.9%;
// --ring: 0 0% 83.1%;
// --border-radius: 5px;

export const defaultLightTheme: Theme = {
    backgroundColor: "0 0% 100%",
    foregroundColor: "0 0% 3.9%",
    cardColor: "0 0% 100%",
    cardForegroundColor: "0 0% 3.9%",
    popoverColor: "0 0% 100%",
    popoverForegroundColor: "0 0% 3.9%",
    primaryColor: "0 0% 9%",
    primaryForegroundColor: "0 0% 98%",
    secondaryColor: "0 0% 96.1%",
    secondaryForegroundColor: "0 0% 9%",
    mutedColor: "0 0% 96.1%",
    mutedForegroundColor: "0 0% 45.1%",
    accentColor: "0 0% 96.1%",
    accentForegroundColor: "0 0% 9%",
    destructiveColor: "0 84.2% 60.2%",
    destructiveForegroundColor: "0 0% 98%",
    borderColor: "0 0% 89.8%",
    inputColor: "0 0% 89.8%",
    ringColor: "0 0% 3.9%",
    radius: "5px",
    outputToplevel: "142 100% 33%",
    outputError: "357 100% 45%",
};

const getThemeFromLS = () => {
    const themeStr = localStorage.getItem("theme");
    return themeStr ? JSON.parse(themeStr) : null;
};

// theme hook, saves theme in preferences
export const useTheme = (): [Theme, (v: Theme) => void] => {
    const [theme, setTheme] = useState<Theme>(
        getThemeFromLS() ?? (isSystemDarkMode() ? defaultDarkTheme : defaultLightTheme)
    );

    // apply theme when theme changes
    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem("theme", JSON.stringify(theme));
    }, [theme]);

    return [theme, setTheme];
};
