// src/pages/rss.xml.ts
import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt({ html: true, linkify: true });

function stripInvalidXmlChars(str: string): string {
  return str.replace(
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
    "",
  );
}

/** 将 HTML 中的相对 src/href 统一转为绝对 URL（以 base 为解析基准） */
function absolutizeHtml(html: string, base: URL): string {
  return html.replace(
    /\s(?:src|href)=(['"])(.+?)\1/gi,
    (_m, quote: string, raw: string) => {
      try {
        const abs = new URL(raw, base); // ./ ../ / 都能解析
        const attr = _m.trim().split("=")[0]; // "src" 或 "href"
        return ` ${attr}=${quote}${abs.toString()}${quote}`;
      } catch {
        return ` ${_m.trim()}`; // 出错就原样返回
      }
    }
  );
}

export async function GET(context: APIContext) {
  const blog = await getSortedPosts();
  const site = (context.site as URL | undefined) ?? new URL("https://leehenry.top");

  const result = rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || "No description",
    site,
    language: "zh-CN", // 修正语言代码
    items: blog.map((post) => {
      const content = typeof post.body === "string" ? post.body : String(post.body || "");
      const cleanedContent = stripInvalidXmlChars(content);

      // 文章页绝对 URL（如果不是 /posts/，请改这里）
      const articleUrl = new URL(url(`/posts/${post.slug}/`), site);

      // Markdown -> HTML -> sanitize
      const rendered = parser.render(cleanedContent);
      const safeHtml = sanitizeHtml(rendered, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "video", "source"]),
        allowedAttributes: {
          a: ["href", "name", "target", "rel"],
          img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
          source: ["src", "srcset", "type", "sizes"],
          video: ["src", "poster", "controls", "preload", "width", "height"],
          "*": ["id", "class", "style"]
        },
        transformTags: {
          a: (tagName, attribs) => ({
            tagName,
            attribs: { ...attribs, rel: attribs.rel ?? "noopener noreferrer" }
          })
        }
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
    // 自引用
    customData: `
      <atom:link xmlns:atom="http://www.w3.org/2005/Atom"
                 href="${new URL("/rss.xml", site).toString()}"
                 rel="self"
                 type="application/rss+xml" />
    `,
  });

  // 兼容不同版本 @astrojs/rss 返回值
  if (result instanceof Response) {
    const headers = new Headers(result.headers);
    headers.set("Content-Type", "application/rss+xml; charset=UTF-8");
    return new Response(await result.text(), { headers });
  } else {
    return new Response(result as string, {
      headers: { "Content-Type": "application/rss+xml; charset=UTF-8" },
    });
  }
}
