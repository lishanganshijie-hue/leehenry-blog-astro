import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants.ts";
import { expressiveCodeConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove("dark");
			break;
		case DARK_MODE:
			document.documentElement.classList.add("dark");
			break;
		case AUTO_MODE:
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			break;
	}

	// Set the theme for Expressive Code
	document.documentElement.setAttribute(
		"data-theme",
		expressiveCodeConfig.theme,
	);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	// 允许用户切换主题，即使主题固定
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function isThemeFixed(): boolean {
	const configCarrier = document.getElementById("config-carrier");
	return configCarrier?.dataset.themeFixed === "true";
}

export function getDefaultThemeFromConfig(): LIGHT_DARK_MODE {
	const configCarrier = document.getElementById("config-carrier");
	return (
		(configCarrier?.dataset.themeDefault as LIGHT_DARK_MODE) || DEFAULT_THEME
	);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	// 优先使用 localStorage 中的值（如果存在）
	// 如果主题固定且没有存储值，使用配置中的默认主题
	const stored = localStorage.getItem("theme") as LIGHT_DARK_MODE;
	if (stored) {
		return stored;
	}
	if (isThemeFixed()) {
		return getDefaultThemeFromConfig();
	}
	return DEFAULT_THEME;
}
