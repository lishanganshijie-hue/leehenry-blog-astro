import { LinkPreset, type NavBarLink } from "@/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: "初见",
		url: "/",
	},
	[LinkPreset.About]: {
		name: "一隅",
		url: "/about/",
	},
	[LinkPreset.Archive]: {
		name: "旧简",
		url: "/archive/",
	},
};
