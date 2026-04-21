import fs from "fs";
import os from "os";
import path from "path";
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

/** 用 sharp 批量读取图片尺寸（优先，Windows/Linux 原生环境均可用） */
async function getSizesViaSharp(paths) {
	const sharp = (await import("sharp")).default;
	const sizes = [];
	for (const p of paths) {
		try {
			const { width, height } = await sharp(p).metadata();
			sizes.push([width ?? 0, height ?? 0]);
		} catch {
			sizes.push([0, 0]);
		}
	}
	return sizes;
}

/** 用 Python Pillow 批量读取（回退方案，适用于 sharp 平台二进制不匹配时） */
function getSizesViaPython(paths) {
	// 用 os.tmpdir() 获取跨平台临时目录（Windows: C:\Users\...\AppData\Local\Temp）
	const tmpScript = path.join(os.tmpdir(), "_gallery_sizes.py");
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

	// 兼容 python3 / python 两种命令名
	const pythonCmd = ["python3", "python"].find((cmd) => {
		try {
			execSync(`${cmd} --version`, { stdio: "ignore" });
			return true;
		} catch {
			return false;
		}
	});
	if (!pythonCmd) throw new Error("找不到 Python，请确保已安装 Python 及 Pillow");

	const output = execSync(`${pythonCmd} "${tmpScript}"`, {
		input: JSON.stringify(paths),
		encoding: "utf8",
	});
	fs.unlinkSync(tmpScript);
	return JSON.parse(output.trim());
}

// 优先尝试 sharp，失败则回退到 Python Pillow
let sizes;
try {
	sizes = await getSizesViaSharp(allImages.map((img) => img.path));
	console.log("✓ 使用 sharp 读取图片尺寸");
} catch (e) {
	console.warn(`sharp 不可用 (${e.message})，回退到 Python Pillow...`);
	sizes = getSizesViaPython(allImages.map((img) => img.path));
	console.log("✓ 使用 Python Pillow 读取图片尺寸");
}

data.images = allImages.map((img, i) => ({
	src: img.src,
	category: img.category,
	w: sizes[i]?.[0] ?? 0,
	h: sizes[i]?.[1] ?? 0,
}));

fs.writeFileSync("src/data/gallery.json", JSON.stringify(data, null, "\t"));
console.log(`✓ 生成 gallery.json，共 ${data.images.length} 张图片`);
