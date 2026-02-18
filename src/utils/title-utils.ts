import { titleSplitConfig } from "../config";

/**
 * 分割标题，识别 "AAA：BBBBB" 格式（仅中文冒号）
 * 返回 { prefix: "AAA", separator: "：", suffix: "BBBBB" } 或 null
 */
export function splitTitle(title: string): {
	prefix: string;
	separator: string;
	suffix: string;
} | null {
	// 仅匹配中文冒号：
	const match = title.match(/^(.+?)(：)(.+)$/);
	if (match) {
		return {
			prefix: match[1].trim(),
			separator: match[2],
			suffix: match[3].trim(),
		};
	}
	return null;
}

/**
 * 获取标题分割配置
 */
export function getTitleSplitConfig() {
	return titleSplitConfig;
}
