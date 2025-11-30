// biome-ignore lint/suspicious/noShadowRestrictedNames: <toString from mdast-util-to-string>
import { toString } from "mdast-util-to-string";

// 判断是否为 CJK 字符（中文、日文、韩文）
function isCJK(char) {
	if (typeof char !== "string" || char.length === 0) return false;
	const code = char.charCodeAt(0);
	return (
		(code >= 0x4e00 && code <= 0x9fff) || // 中文
		(code >= 0x3040 && code <= 0x309f) || // 日文平假名
		(code >= 0x30a0 && code <= 0x30ff) || // 日文片假名
		(code >= 0xac00 && code <= 0xd7a3) || // 韩文
		(code >= 0x20000 && code <= 0x2ebe0) // CJK 扩展
	);
}

// 判断是否为空白字符
function isWhitespace(char) {
	return /\s/.test(char);
}

// 统计字数
function countWords(text) {
	let words = 0;
	const trimmed = text.trim();
	if (trimmed.length === 0) return 0;

	for (let i = 0; i < trimmed.length; i++) {
		const char = trimmed[i];
		// CJK 字符每个算一个词
		if (isCJK(char)) {
			words++;
		}
		// 英文单词：非空白字符，且下一个字符是空白字符、CJK字符或不存在
		else if (!isWhitespace(char)) {
			const nextChar = trimmed[i + 1];
			if (nextChar === undefined || isWhitespace(nextChar) || isCJK(nextChar)) {
				words++;
			}
		}
	}

	return words;
}

export function remarkReadingTime() {
	return (tree, { data }) => {
		const textOnPage = toString(tree);
		const words = countWords(textOnPage);
		const wordsPerMinute = 550;
		const minutes = Math.max(1, Math.round(words / wordsPerMinute));

		data.astro.frontmatter.minutes = minutes;
		data.astro.frontmatter.words = words;
	};
}
