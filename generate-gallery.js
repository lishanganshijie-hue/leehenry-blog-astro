import fs from "fs";

const data = {
	categories: [
		{ id: "all", name: "一览" },
		{ id: "portrait", name: "特写 · 眉间心上" },
		{ id: "landscape", name: "沧海 · 大塊假我" },
		{ id: "street", name: "阡陌 · 人间烟火" },
		{ id: "still", name: "物语 · 惟石能言" },
	],
	images: [],
};

const dirs = ["portrait", "landscape", "street", "still"];

dirs.forEach((dir) => {
	const path = `public/gallery/${dir}`;
	if (fs.existsSync(path)) {
		const files = fs.readdirSync(path).filter((f) => f.endsWith(".webp"));
		files.forEach((file) => {
			data.images.push({
				src: `/gallery/${dir}/${file}`,
				category: dir,
			});
		});
	}
});

fs.writeFileSync("src/data/gallery.json", JSON.stringify(data, null, "\t"));
console.log(`Generated gallery.json with ${data.images.length} images`);
