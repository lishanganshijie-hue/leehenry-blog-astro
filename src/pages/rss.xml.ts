import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const md = new MarkdownIt({ html: true, linkify: true });

function stripInvalidXmlChars(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g, "");
}

/** 将 HTML 中的相对 src/href 转为绝对 URL（以 base 为解析基准） */
function absolutizeHtml(html: string, base: URL): string {
  return html.replace(/\s(?:src|href)=(['"])(.+?)\1/gi, (_m, quote: string, raw: string) => {
    try {
      const abs = new URL(raw, base);                 // 绝对/./..// 开头都能解析
      const attr = _m.trim().split("=")[0];          // "src" 或 "href"
      return ` ${attr}=${quote}${abs.toString()}${quote}`;
    } catch {
      return ` ${_m.trim()}`;
    }
  });
}

export async function GET(context: APIContext) {
  const posts = await getSortedPosts();

  // 站点绝对地址：优先 context.site，否则用配置/兜底
  const site =
    context.site instanceof URL ? context.site : new URL(siteConfig?.site ?? "https://leehenry.top");

  // ⚠️ 关键：一定要 await
  const feed = await rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || "No description",
    site,                 // 必须是绝对 URL
    language: "zh-CN",
    items: posts.map((post) => {
      const raw = typeof post.body === "string" ? post.body : String(post.body ?? "");
      const cleaned = stripInvalidXmlChars(raw);

      // 如果你的文章不在 /posts/ 下，请改这里
      const articleUrl = new URL(url(`/posts/${post.slug}/`), site);

      // Markdown -> HTML -> sanitize
      const rendered = md.render(cleaned);
      const safeHtml = sanitizeHtml(rendered, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "video", "source"]),
        allowedAttributes: {
          a: ["href", "name", "target", "rel"],
          img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
          source: ["src", "srcset", "type", "sizes"],
          video: ["src", "poster", "controls", "preload", "width", "height"],
          "*": ["id", "class", "style"],
        },
        transformTags: {
          a: (tag, attrs) => ({
            tagName: "a",
            attribs: { ...attrs, rel: attrs.rel ?? "noopener noreferrer" },
          }),
        },
      });

      const htmlWithAbs = absolutizeHtml(safeHtml, articleUrl);

      return {
        title: post.data.title,
        pubDate: post.data.published,
        description: post.data.description || "",
        link: articleUrl.toString(),
        content: htmlWithAbs,
        guid: articleUrl.toString(),
      };
    }),
    customData: `
      <atom:link xmlns:atom="http://www.w3.org/2005/Atom"
                 href="${new URL("/rss.xml", site).toString()}"
                 rel="self"
                 type="application/rss+xml" />
    `,
  });

  // 统一拿到纯字符串（feed 可能是 Response 或 string）
  const xml =
    feed && typeof (feed as any).text === "function"
      ? await (feed as any).text()
      : (feed as string);

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=UTF-8" },
  });
}
