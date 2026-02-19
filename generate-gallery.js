import fs from "fs";
import { execSync } from "child_process";

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
const allImages = [];

for (const dir of dirs) {
	const dirPath = `public/gallery/${dir}`;
	if (fs.existsSync(dirPath)) {
		fs.readdirSync(dirPath)
			.filter((f) => /\.(webp|jpg|jpeg|png|avif)$/i.test(f))
			.forEach((file) => {
				allImages.push({
					path: `${dirPath}/${file}`,
					src: `/gallery/${dir}/${file}`,
					category: dir,
				});
			});
	}
}

// 用 Python Pillow 一次性读取所有图片尺寸（纯 Python，无需原生依赖）
const tmpScript = "/tmp/_gallery_sizes.py";
fs.writeFileSync(
	tmpScript,
	`import sys, json
from PIL import Image
paths = json.load(sys.stdin)
out = []
for p in paths:
    try:
        img = Image.open(p)
        out.append([img.width, img.height])
    except Exception:
        out.append([0, 0])
print(json.dumps(out))
`,
);

const output = execSync(`python3 ${tmpScript}`, {
	input: JSON.stringify(allImages.map((img) => img.path)),
	encoding: "utf8",
});
fs.unlinkSync(tmpScript);

const dims = JSON.parse(output.trim());

data.images = allImages.map((img, i) => ({
	src: img.src,
	category: img.category,
	w: dims[i]?.[0] ?? 0,
	h: dims[i]?.[1] ?? 0,
}));

fs.writeFileSync("src/data/gallery.json", JSON.stringify(data, null, "\t"));
console.log(`Generated gallery.json with ${data.images.length} images`);
