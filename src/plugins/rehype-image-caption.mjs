import { visit } from "unist-util-visit";
import { h } from "hastscript";

/**
 * Rehype plugin to add captions to images based on their alt text.
 * Wraps images with non-empty alt text in a figure container with a figcaption.
 */
export function rehypeImageCaption() {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (node.tagName === "img" && node.properties?.alt) {
				const altText = node.properties.alt;
				
				// Only add caption if alt text is not empty
				if (altText && altText.trim() !== "") {
					// Create a figure wrapper with the image and caption
					const figure = h("figure", { class: "image-with-caption" }, [
						node, // The original image
						h("figcaption", { class: "image-caption" }, altText),
					]);
					
					// Replace the img node with the figure wrapper
					if (parent && typeof index === "number") {
						parent.children[index] = figure;
					}
				}
			}
		});
	};
}

