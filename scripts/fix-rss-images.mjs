import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../dist");
const rssPath = join(distPath, "rss.xml");
const astroPath = join(distPath, "_astro");

console.log("[RSS Fix] 开始修复 RSS 图片路径...");

// 读取 RSS 文件
let rssContent = readFileSync(rssPath, "utf-8");

// 获取 _astro 目录中的所有图片文件
const astroFiles = readdirSync(astroPath);

// 创建图片名称到优化路径的映射
const imageMap = new Map();
for (const file of astroFiles) {
	// 提取原始图片名（去除哈希和扩展名）
	// 例如：image-20251105031802389.ByFPNsWM_28KcFz.webp -> image-20251105031802389
	const match = file.match(/^(.+?)\.[A-Za-z0-9_-]+\.(webp|png|jpg|jpeg|gif)$/);
	if (match) {
		const originalName = match[1];
		imageMap.set(originalName, file);
	}
}

console.log(`[RSS Fix] 找到 ${imageMap.size} 个优化图片`);

// 替换 RSS 中的图片路径
// 匹配形如：https://leehenry.top/.../*.png 的图片链接
let fixedCount = 0;
rssContent = rssContent.replace(
	/https:\/\/leehenry\.top\/([^"'\s]+\/)?([^"'\s]+?)\.(png|jpg|jpeg|gif)/g,
	(match, path, imageName, ext) => {
		if (imageMap.has(imageName)) {
			const optimizedFile = imageMap.get(imageName);
			fixedCount++;
			return `https://leehenry.top/_astro/${optimizedFile}`;
		}
		return match;
	},
);

// 写回 RSS 文件
writeFileSync(rssPath, rssContent, "utf-8");

console.log(`[RSS Fix] 完成！修复了 ${fixedCount} 个图片链接`);
