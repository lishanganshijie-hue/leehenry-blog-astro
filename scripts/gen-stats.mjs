// scripts/gen-stats.mjs
import {
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { extname, join } from "node:path";

const POSTS_DIR = "src/content/posts";

let totalZhChars = 0;
let totalEnWords = 0;
let totalPosts = 0;
const postEntries = []; // { date: string, words: number }[]

function trimTrailingZeros(value) {
	return value.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function formatCharCount(count) {
	if (count >= 1e8) {
		return `${trimTrailingZeros(
			(count / 1e8).toFixed(count >= 1e9 ? 1 : 2),
		)} 亿字`;
	}

	if (count >= 1e4) {
		return `${trimTrailingZeros(
			(count / 1e4).toFixed(count >= 1e5 ? 1 : 2),
		)} 万字`;
	}

	if (count >= 1e3) {
		return `${trimTrailingZeros((count / 1e3).toFixed(1))} 千字`;
	}

	return `${count} 字`;
}

function extractDate(raw) {
	const m = raw.match(/^---[\s\S]*?published\s*:\s*["']?(\d{4}-\d{2}-\d{2})/m);
	return m ? m[1] : null;
}

function stripMdText(input) {
	let out = input.replace(/^\uFEFF?/, ""); // 去 BOM
	out = out.replace(/^---[\s\S]*?---\r?\n/, ""); // frontmatter
	out = out.replace(/```[\s\S]*?```/g, ""); // 代码块
	out = out.replace(/`[^`]+`/g, ""); // 行内代码
	out = out.replace(/!\[[^\]]*]\([^)]+\)/g, ""); // 图片
	out = out.replace(/\[[^\]]*]\([^)]+\)/g, ""); // 链接
	out = out.replace(/[#>*_\-+|>`~]/g, ""); // 标记符
	return out;
}

function walkDir(dir) {
	const entries = readdirSync(dir);
	for (const name of entries) {
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) {
			walkDir(p);
		} else {
			const ext = extname(p).toLowerCase();
			if (ext === ".md" || ext === ".mdx") {
				const raw = readFileSync(p, "utf8");
				const text = stripMdText(raw);

				const zh = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
				const en = text
					.replace(/[\u4e00-\u9fa5]/g, " ")
					.trim()
					.split(/\s+/)
					.filter(Boolean).length;

				totalZhChars += zh;
				totalEnWords += en;
				totalPosts += 1;

				const date = extractDate(raw);
				if (date) {
					postEntries.push({ date, words: zh + en });
				}
			}
		}
	}
}

function formatDateToBeijing(date) {
	// const offset = 8 * 60; // 东八区，单位：分钟
	// const local = new Date(date.getTime() + offset * 60 * 1000);
	const local = new Date(date.getTime());
	const pad = (n) => String(n).padStart(2, "0");

	return (
		`${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())} ` +
		`${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())}`
	);
}

walkDir(POSTS_DIR);

const totalChars = totalZhChars + totalEnWords;

const stats = {
	generatedAt: formatDateToBeijing(new Date()),
	totalPosts,
	totalZhChars,
	totalEnWords,
	// totalHumanReadable: `${totalZhChars} 字，${totalEnWords} 词`,
	totalHumanReadable: formatCharCount(totalChars),
};

mkdirSync("public", { recursive: true });
mkdirSync("src/data", { recursive: true });

writeFileSync("public/stats.json", JSON.stringify(stats, null, 2), "utf8");
writeFileSync("src/data/stats.json", JSON.stringify(stats, null, 2), "utf8");
writeFileSync("src/data/post-words.json", JSON.stringify(postEntries, null, 2), "utf8");

console.log("[stats]", stats);
