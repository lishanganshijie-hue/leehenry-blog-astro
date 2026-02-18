/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}"],
	darkMode: "class", // allows toggling dark mode manually
	theme: {
		borderRadius: {
			none: '0',       // 默认直角
			sm: '0',
			DEFAULT: '0',
			md: '0',
			lg: '0',
			xl: '0',
			'2xl': '0',
			'3xl': '0',
			full: '9999px',  // full 保留原来的圆形用法
		  },
		extend: {
			fontFamily: {
				// sans: ["Roboto", "sans-serif", ...defaultTheme.fontFamily.sans],
				sans: ["vivo Sans", "sans-serif", ...defaultTheme.fontFamily.sans],
				serif: ["BeiWeiKaiShu", "serif", ...defaultTheme.fontFamily.serif],
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
