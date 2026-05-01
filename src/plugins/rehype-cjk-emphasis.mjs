import { h } from "hastscript";
import { visit } from "unist-util-visit";

// CJK Unified Ideographs (U+4E00-U+9FFF) + Extension A (U+3400-U+4DBF)
const CJK_RE = /[一-鿿㐀-䶿]+/g;

function splitByCJK(text) {
	const segments = [];
	const re = new RegExp(CJK_RE.source, "g");
	let lastIndex = 0;
	let match;
	while ((match = re.exec(text)) !== null) {
		if (match.index > lastIndex) {
			segments.push({ text: text.slice(lastIndex, match.index), isCJK: false });
		}
		segments.push({ text: match[0], isCJK: true });
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < text.length) {
		segments.push({ text: text.slice(lastIndex), isCJK: false });
	}
	return segments;
}

/**
 * Rehype plugin: within <em> elements, wrap CJK character runs in
 * <span class="emphasis-cjk"> so CSS can apply text-emphasis dots
 * instead of italic. Non-CJK text stays in the <em> and remains italic.
 */
export function rehypeCjkEmphasis() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (node.tagName !== "em") return;

			const newChildren = [];
			let changed = false;

			for (const child of node.children) {
				if (child.type !== "text") {
					newChildren.push(child);
					continue;
				}

				const segments = splitByCJK(child.value);

				if (segments.length === 1 && !segments[0].isCJK) {
					newChildren.push(child);
					continue;
				}

				changed = true;
				for (const seg of segments) {
					if (seg.isCJK) {
						newChildren.push(h("span", { class: "emphasis-cjk" }, seg.text));
					} else if (seg.text) {
						newChildren.push({ type: "text", value: seg.text });
					}
				}
			}

			if (changed) {
				node.children = newChildren;
			}
		});
	};
}
