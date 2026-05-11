import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';

const POSTS_DIR = path.resolve('./src/content/posts');
const OUTPUT_FILE = path.resolve('./public/posts-index.json');

async function generateIndex() {
  // 1. 依然使用 fast-glob 寻找所有 md 文件
  const files = await fg(['**/*.md'], { cwd: POSTS_DIR });

  const index = files.map((filePath) => {
    // 【新增】同步读取文件内容，用于解析 Frontmatter
    const fullPath = path.join(POSTS_DIR, filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // 【新增】正则表达式提取标题和日期
    // 匹配 title: "xxx" 或 title: xxx
    const titleMatch = content.match(/^title:\s*(["']?)(.*?)\1\s*$/m);
    // 匹配 published: 2024-05-11
    const dateMatch = content.match(/^published:\s*(["']?)(.*?)\1\s*$/m);

    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1] || '';
    
    // 优先使用文件内的 title，没有则用文件名
    const title = titleMatch ? titleMatch[2] : fileName.replace(/\.md$/, '');
    const date = dateMatch ? dateMatch[2] : null;
    const category = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    
    return {
      path: filePath,
      title: title,
      date: date,       // 【关键】现在有日期了
      category: category,
    };
  });

  // 2. 按日期倒序排列（让最新文章排在最前面）
  index.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`Generated posts index with ${index.length} items.`);
}

generateIndex().catch((err) => {
  console.error('Error generating posts index:', err);
  process.exit(1);
});
