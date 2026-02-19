import fs from "fs";

const BLOG_URL = "https://leehenry.top";

const friends = JSON.parse(
	fs.readFileSync("src/data/friends.json", "utf8"),
);

// 过滤：排除隐藏条目和 org 类型（组织一般无 RSS 订阅价值）
const filtered = friends.filter(
	(f) => !f.hidden && f.category !== "org",
);

// 转换为 FC-Lite 期望格式：[name, blogUrl, avatarUrl]
const output = {
	friends: filtered.map((f) => [
		f.name,
		f.url,
		// 相对路径转绝对 URL，外部链接保持不变
		f.avatar.startsWith("/") ? `${BLOG_URL}${f.avatar}` : f.avatar,
	]),
};

fs.writeFileSync(
	"public/fcircle-friends.json",
	JSON.stringify(output, null, "\t"),
);
console.log(`✓ 生成 fcircle-friends.json，共 ${output.friends.length} 位友链`);
