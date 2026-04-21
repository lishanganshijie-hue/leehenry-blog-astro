/**
 * Rehype plugin: convert deprecated HTML `align` attribute on table cells
 * to modern `style="text-align: ..."` inline styles.
 *
 * mdast-util-to-hast@13 generates <td align="center"> instead of
 * <td style="text-align: center"> (upstream known issue).
 */
import { visit } from "unist-util-visit";

export function rehypeTableAlign() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (
				(node.tagName === "td" || node.tagName === "th") &&
				node.properties?.align
			) {
				const align = node.properties.align;
				node.properties.style = `text-align: ${align}${node.properties.style ? `; ${node.properties.style}` : ""}`;
				delete node.properties.align;
			}
		});
	};
}
