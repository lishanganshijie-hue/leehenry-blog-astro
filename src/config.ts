import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "伏枥之间",
	subtitle: "WhistleWanderer",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: true, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "assets/images/banner.gif", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: true, // Display the credit text of the banner image
			text: "pinterest.com", // Credit text to be displayed
			url: "https://pin.it/3yAF6aKbf", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	twikoo: {
		enable: true, // Enable Twikoo comment system
		envId: 'https://twikoo.leehenry.top/', // Replace with your Vercel deployment URL
		region: '', // Optional: Twikoo region (留空即可)
		lang: 'zh-CN', // Language for Twikoo
	},
	favicon: [
		// Leave this array empty to use the default favicon
		{
		  src: '/favicon/leaf-solid.svg',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		}
	],
};

// export const navBarConfig = {
// 	links: [
// 		LinkPreset.Home,
// 		LinkPreset.Archive,
// 		LinkPreset.About,
// 		{ name: "友链", url: "/friends/" }, // 新增
// 		{
// 			name: "GitHub",
// 			url: "https://github.com/LeeHero0803",
// 			external: true,
// 		},
// 	],
// };

export const navBarConfig = {
	links: [
		{ name: "初见", url: "/", icon: "fa6-solid:house" },
		{ name: "旧简", url: "/archive/", icon: "fa6-solid:box-archive" },
		{ name: "一隅", url: "/about/", icon: "fa6-solid:user" },
		{ name: "留心", url: "/guestbook/", icon: "fa6-solid:message" },
		{ name: "友邻", url: "/friends/", icon: "fa6-solid:link" },
		{
			name: "开往",
			url: "https://www.travellings.cn/train.html",
			external: true,
			icon: "fa6-solid:train-subway",
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/friends/my-avatar-portrait.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "伏枥 | Henry Lee",
	bio: "别让今天叫住我了",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/LeeHero0803",
		},
		// {
		// 	name: "Twitter",
		// 	icon: "fa6-brands:twitter",
		// 	url: "https://twitter.com/yourname",
		// },
		// {
		// 	name: "知乎",
		// 	icon: "simple-icons:zhihu",
		// 	url: "https://www.zhihu.com/people/xxx",
		// },
		{
			name: "B站",
			icon: "simple-icons:bilibili",
			url: "https://space.bilibili.com/29402544",
		},
		{
			name: "微信",
			icon: "simple-icons:wechat",
			url: "#",
			popup: true,
			popupImage: "/wechat-qrcode.png",
		},
		{
			name: "邮箱",
			icon: "fa6-regular:envelope",
			url: "mailto:leehenry1024@qq.com",
		},
		{
			name: "RSS 订阅",
			icon: "fa6-solid:square-rss",
			url: "https://leehenry.top/rss.xml",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-ND 4.0",
	url: "https://creativecommons.org/licenses/by-nc-nd/4.0",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
