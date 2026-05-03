import { visit } from "unist-util-visit";

export function rehypeFootnoteText() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (
				node.tagName === "a" &&
				node.properties?.dataFootnoteBackref !== undefined
			) {
				for (const child of node.children) {
					if (child.type === "text") {
						child.value = child.value.replace(/↩/g, "↩︎");
					}
				}
			}
		});
	};
}
