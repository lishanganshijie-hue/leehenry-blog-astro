import rss from "@astrojs/rss";
import { getSortedPostsForFeeds } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const md = new MarkdownIt({ html: true, linkify: true });

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: Required for XML compatibility
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

/** 将 HTML 中的相对 src/href 转为绝对 URL（以 base 为解析基准） */
function absolutizeHtml(html: string, base: URL): string {
	return html.replace(
		/\s(?:src|href)=(['"])(.+?)\1/gi,
		(_m, quote: string, raw: string) => {
			try {
				const abs = new URL(raw, base); 
				const attr = _m.trim().split("=")[0]; 
				return ` ${attr}=${quote}${abs.toString()}${quote}`;
			} catch {
				return ` ${_m.trim()}`;
			}
		},
	);
}

export async function GET(context: APIContext) {
	const posts = await getSortedPostsForFeeds();

	const site =
		context.site instanceof URL
			? context.site
			: new URL("https://blogo.ccwu.cc");

	// 规避模板字符串内包含中文标点引发的编译歧义,移出到外层作为纯文本常量
	const rssDescription = (siteConfig.subtitle || "No description") + " - 人生苦短,绝不做闭口禅！";

	const feed = await rss({
		title: siteConfig.title,
		description: rssDescription,
		site, 
		items: await Promise.all(
			posts.map(async (post) => {
				const articleUrl = new URL(url(`/posts/${post.slug}/`), site);
				const raw = typeof post.body === "string" ? post.body : String(post.body ?? "");
				const cleaned = stripInvalidXmlChars(raw);

				let renderedHtml = md.render(cleaned);
				renderedHtml = stripInvalidXmlChars(renderedHtml);

				const safeHtml = sanitizeHtml(renderedHtml, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat([
						"img",
						"video",
						"source",
					]),
					allowedAttributes: {
						a: ["href", "name", "target", "rel"],
						img: [
							"src",
							"alt",
							"title",
							"width",
							"height",
							"loading",
							"decoding",
							"srcset",
						],
						source: ["src", "srcset", "type", "sizes"],
						video: ["src", "poster", "controls", "preload", "width", "height"],
						"*": ["id", "class", "style"],
					},
					transformTags: {
						a: (_tag, attrs) => ({
							tagName: "a",
							attribs: { ...attrs, rel: attrs.rel ?? "noopener noreferrer" },
						}),
					},
				});

				const htmlWithAbs = absolutizeHtml(safeHtml, site);

				const commentUrl = `${articleUrl.toString()}#comment-section`;
				const thankYouMarkdown = `> 感谢读到这里！您的声音将对我非常重要,欢迎点击[此处](${commentUrl})查看并参与朋友们关于本文的讨论:)))。`;
				const thankYouHtml = md.render(thankYouMarkdown);
				const thankYouSafe = sanitizeHtml(thankYouHtml, {
					allowedTags: sanitizeHtml.defaults.allowedTags,
					allowedAttributes: {
						a: ["href", "name", "target", "rel"],
					},
					transformTags: {
						a: (_tag, attrs) => ({
							tagName: "a",
							attribs: { ...attrs, rel: attrs.rel ?? "noopener noreferrer" },
						}),
					},
				});
				const thankYouWithAbs = absolutizeHtml(thankYouSafe, site);
				const finalContent = `${htmlWithAbs}\n${thankYouWithAbs}`;

				return {
					title: post.data.title,
					pubDate: post.data.published,
					description: post.data.description || "",
					link: articleUrl.toString(),
					content: finalContent,
					guid: articleUrl.toString(),
				};
			}),
		),
		customData: `
      <image>
        <url>${new URL("/favicon.ico", site).toString()}</url>
        <title>${siteConfig.title}</title>
        <link>${site.toString()}</link>
      </image>
      <atom:link xmlns:atom="http://www.w3.org/2005/Atom"
                 href="${new URL("/rss.xml", site).toString()}"
                 rel="self"
                 type="application/rss+xml" />
      <atom:link xmlns:atom="http://www.w3.org/2005/Atom"
                 href="https://pubsubhubbub.appspot.com/"
                 rel="hub" />
    `,
	});

	const xml =
		feed &&
		typeof (feed as unknown as { text?: () => Promise<string> }).text ===
			"function"
			? await (feed as unknown as { text: () => Promise<string> }).text()
			: (feed as unknown as string);

	return new Response(xml, {
		headers: { "Content-Type": "application/rss+xml; charset=UTF-8" },
	});
}