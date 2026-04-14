import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
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
				const abs = new URL(raw, base); // 绝对/./..// 开头都能解析
				const attr = _m.trim().split("=")[0]; // "src" 或 "href"
				return ` ${attr}=${quote}${abs.toString()}${quote}`;
			} catch {
				return ` ${_m.trim()}`;
			}
		},
	);
}

export async function GET(context: APIContext) {
	const posts = await getSortedPosts();

	// 站点绝对地址：优先 context.site，否则用配置/兜底
	const site =
		context.site instanceof URL
			? context.site
			: new URL("https://leehenry.top");

	// ⚠️ 关键：一定要 await
	const feed = await rss({
		title: siteConfig.title,
		description: `${siteConfig.subtitle || "No description"}「别让今天叫住我了」`,
		site, // 必须是绝对 URL
		items: await Promise.all(
			posts.map(async (post) => {
				// 如果你的文章不在 /posts/ 下，请改这里
				const articleUrl = new URL(url(`/posts/${post.slug}/`), site);

				// 获取原始 Markdown 内容
				const raw =
					typeof post.body === "string" ? post.body : String(post.body ?? "");
				const cleaned = stripInvalidXmlChars(raw);

				// Markdown -> HTML
				let renderedHtml = md.render(cleaned);

				// 注意：图片路径会在构建后通过 fix-rss-images.mjs 脚本修复
				// 该脚本会将相对路径替换为 Astro 优化后的 _astro/ 路径

				// 清理无效的 XML 字符
				renderedHtml = stripInvalidXmlChars(renderedHtml);

				// 清理和验证 HTML
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

				// 将相对路径转换为绝对路径（图片路径应该已经是正确的 _astro/ 路径了）
				const htmlWithAbs = absolutizeHtml(safeHtml, site);

				// 添加感谢信息和评论区链接的引用框
				const commentUrl = `${articleUrl.toString()}#comment-section`;
				const thankYouMarkdown = `> 感谢读到这里！您的声音将对我非常重要，欢迎点击[此处](${commentUrl})查看并参与读者们关于本文的讨论:)))。`;
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

	// 统一拿到纯字符串（feed 可能是 Response 或 string）
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
