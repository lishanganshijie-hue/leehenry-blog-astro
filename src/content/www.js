import fs from "fs";
import path from "path";

const rootDir =
	"C:/Users/LeeHero/Desktop/LH-Blog/leehenry-blog/src/content/posts";

function walk(dir) {
	for (const file of fs.readdirSync(dir)) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);
		if (stat.isDirectory()) {
			walk(fullPath);
		} else if (file.endsWith(".md")) {
			let content = fs.readFileSync(fullPath, "utf8");
			content = content.replace(/“/g, "「").replace(/”/g, "」");
			fs.writeFileSync(fullPath, content, "utf8");
			console.log(`✅ 已处理: ${fullPath}`);
		}
	}
}

walk(rootDir);
