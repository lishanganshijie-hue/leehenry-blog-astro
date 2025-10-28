# Twikoo 调试指南

## 问题现状
- ✅ 404 错误已解决（twikoo-loader.js 已正确部署）
- ❌ 评论组件不显示（本地正常，线上异常）

## 调试步骤

### 1. 重新构建和部署

首先，重新构建项目以包含新的调试日志：

```bash
npm run build
```

然后部署到生产环境。

### 2. 打开浏览器控制台

访问你的网站上的任意文章页面或留言板页面，打开浏览器开发者工具（F12），查看控制台（Console）标签。

### 3. 查看调试日志

你应该能看到以 `[Twikoo]` 或 `[TwikooLoader]` 开头的调试信息。根据不同的日志输出，可以诊断具体问题：

#### 场景 A：看不到任何 Twikoo 相关日志

**可能原因：**
- Twikoo 组件没有被渲染
- 配置中 `twikoo.enable` 为 false

**排查方法：**
1. 检查页面 HTML 源码，搜索 `tcomment` 或 `twikoo`
2. 确认 `src/config.ts` 中的 `twikoo.enable` 为 `true`
3. 检查是否在正确的页面（文章页面或留言板）

#### 场景 B：看到 "[Twikoo] 开始初始化..." 但后续没有日志

**可能原因：**
- 脚本执行被阻断
- Content Security Policy (CSP) 问题

**排查方法：**
1. 查看控制台是否有 CSP 或安全相关错误
2. 查看网络（Network）标签，检查 twikoo.min.js 是否成功加载

#### 场景 C：看到 "[Twikoo] twikoo.min.js 加载失败"

**可能原因：**
- CDN 被墙或不可访问
- 网络问题

**解决方案：**
尝试更换 CDN，编辑 `src/components/misc/Twikoo.astro`：

```javascript
// 原来的 CDN
script.src = 'https://registry.npmmirror.com/twikoo/1.6.44/files/dist/twikoo.min.js';

// 备选 CDN 1 - jsDelivr
script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.44/dist/twikoo.all.min.js';

// 备选 CDN 2 - unpkg
script.src = 'https://unpkg.com/twikoo@1.6.44/dist/twikoo.all.min.js';
```

#### 场景 D：看到 "[Twikoo] #tcomment 元素不存在！"

**可能原因：**
- 脚本执行时机问题，DOM 还未准备好
- 页面结构问题

**解决方案：**
添加延迟加载或使用 DOMContentLoaded 事件。

#### 场景 E：看到 "[Twikoo] 初始化错误" 或 Twikoo 内部错误

**可能原因：**
- envId 配置错误
- Twikoo 服务器无法访问
- 跨域问题

**排查方法：**
1. 检查错误信息的详细内容
2. 手动访问你的 Twikoo 服务器地址：`https://twikoo.leehenry.top/`
3. 检查网络（Network）标签，查看对 Twikoo API 的请求是否成功
4. 确认 envId 配置正确（在 `src/config.ts` 中）

#### 场景 F：所有日志都正常，但评论框不显示

**可能原因：**
- CSS 样式问题
- 元素被隐藏
- z-index 层级问题

**排查方法：**
1. 在控制台执行：
   ```javascript
   document.getElementById('tcomment')
   ```
   查看元素是否存在
2. 检查元素的样式，是否有 `display: none` 或 `visibility: hidden`
3. 检查元素的尺寸：
   ```javascript
   document.getElementById('tcomment').getBoundingClientRect()
   ```

### 4. 检查网络请求

在浏览器开发者工具的 Network（网络）标签中：

1. **检查 twikoo.min.js 是否成功加载**
   - 状态应该是 200
   - 如果是 404，说明 CDN 路径错误
   - 如果是 CORS 错误，说明有跨域问题

2. **检查 twikoo-loader.js 是否成功加载**
   - 状态应该是 200
   - 如果是 404，说明文件没有部署到 public 目录

3. **检查对 Twikoo API 的请求**
   - 应该有对 `https://twikoo.leehenry.top/` 的请求
   - 检查请求和响应的内容
   - 如果有错误，查看错误信息

### 5. 检查 Twikoo 服务器

访问你的 Twikoo 服务器地址：`https://twikoo.leehenry.top/`

- 应该返回 Twikoo 的欢迎信息或 API 文档
- 如果无法访问，说明服务器配置有问题

### 6. 常见问题和解决方案

#### 问题：跨域 (CORS) 错误

**错误信息示例：**
```
Access to fetch at 'https://twikoo.leehenry.top/' from origin 'https://leehenry.top' has been blocked by CORS policy
```

**解决方案：**
在 Twikoo 服务器端配置 CORS 允许你的域名。如果使用 Vercel 部署 Twikoo，需要在环境变量中配置 `CORS_ALLOW_ORIGIN`。

#### 问题：Twikoo 配置错误

**检查配置：**
```typescript
// src/config.ts
twikoo: {
    enable: true,
    envId: 'https://twikoo.leehenry.top/',  // 确保 URL 正确，末尾有 /
    region: '',  // 如果不是腾讯云，留空
    lang: 'zh-CN',
}
```

#### 问题：路径问题

Twikoo 使用 `location.pathname` 作为评论的唯一标识。确保：
- 路径格式一致
- 没有多余的斜杠
- 编码正确

### 7. 临时测试方案

在控制台直接执行以下代码，测试 Twikoo 是否能手动初始化：

```javascript
// 1. 先加载 Twikoo 脚本（如果还没加载）
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.44/dist/twikoo.all.min.js';
document.head.appendChild(script);

// 2. 等待脚本加载后（几秒钟），执行初始化
script.onload = function() {
    twikoo.init({
        envId: 'https://twikoo.leehenry.top/',
        el: '#tcomment',
        region: '',
        path: location.pathname,
        lang: 'zh-CN'
    });
};
```

如果手动初始化成功，说明：
- Twikoo 服务器正常
- 配置正确
- 问题在于脚本的自动加载逻辑

## 调试完成后

找到问题并解决后，记得移除调试日志以优化性能：
1. 恢复 `src/components/misc/Twikoo.astro` 中的 console.log
2. 恢复 `public/scripts/twikoo-loader.js` 中的 console.log
3. 重新构建和部署

## 需要帮助？

如果以上步骤都无法解决问题，请提供：
1. 完整的控制台日志（包括所有 [Twikoo] 开头的信息）
2. Network 标签中的相关请求和响应
3. 任何错误信息的完整堆栈

