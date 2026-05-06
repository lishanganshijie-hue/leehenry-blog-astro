/** @type {import('tailwindcss').Config} */

const EMOJI = ["Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"];

module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}"],
	darkMode: "class",
	theme: {
		borderRadius: {
			none: "0",
			sm: "0",
			DEFAULT: "0",
			md: "0",
			lg: "0",
			xl: "0",
			"2xl": "0",
			"3xl": "0",
			full: "9999px",
		},
		extend: {
			fontFamily: {
				sans:  ["vivo Sans",              ...EMOJI, "system-ui", "sans-serif"],
				serif: ["Zhuque Fangsong", "STKaiti", "KaiTi", ...EMOJI, "serif"],
				mono:  ["JetBrains Mono Variable", ...EMOJI, "vivo Sans", "ui-monospace", "monospace"],
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
