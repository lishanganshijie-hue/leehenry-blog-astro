import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';

/**
 * 自动生成博客文章索引
 * 输出到 public/posts-index.json
 */

const POSTS_DIR = path.resolve('./src/content/posts');
const OUTPUT_FILE = path.resolve('./public/posts-index.json');

async function generateIndex() {
  const files = await fg(['**/*.md'], { cwd: POSTS_DIR });

  const index = files.map((filePath) => {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1] || '';
    const title = fileName.replace(/\.md$/, '');
    const category = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    
    return {
      path: filePath,
      title: title,
      category: category,
    };
  });

  // 确保 public 目录存在
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
