import type { AstroIntegration } from "@swup/astro";

declare global {
	interface Window {
		// type from '@swup/astro' is incorrect
		swup: AstroIntegration;
		pagefind: {
			search: (query: string) => Promise<{
				results: Array<{
					data: () => Promise<SearchResult>;
				}>;
			}>;
		};
		__galleryData?: {
			images: GalleryImage[];
			categories: GalleryCategory[];
			currentCategory: string;
		};
	}
}

interface GalleryImage {
	src: string;
	category: string;
	width: number;
	height: number;
	title?: string;
	description?: string;
	exif?: {
		camera?: string;
		aperture?: string;
		shutter?: string;
		iso?: string;
	};
}

interface GalleryCategory {
	id: string;
	name: string;
	icon: string;
}

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}
