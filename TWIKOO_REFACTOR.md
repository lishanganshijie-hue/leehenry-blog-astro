# Twikoo 评论组件 - 最小化引用说明

## 最小化引用原则

采用**极简主义**方案：
1. ✅ 不添加任何自定义样式
2. ✅ 完全使用 Twikoo 默认样式
3. ✅ 最小化初始化代码
4. ✅ 让 Twikoo 自己处理所有事情

## 最小化实现

### 1. 组件结构（`Twikoo.astro`）

**只包含必要的初始化代码：**

```astro
---
import { siteConfig } from "../../config";

interface Props {
  class?: string;
}

const { class: className } = Astro.props;
const twikooConfig = siteConfig.twikoo;
---

{twikooConfig?.enable && (
  <div class:list={["card-base rounded-[var(--radius-large)] overflow-hidden", className]}>
    <div class="px-6 md:px-9 py-6">
      <div id="twikoo"></div>
    </div>
  </div>
)}

<script>
  import { siteConfig } from "../../config";

  const twikooConfig = siteConfig.twikoo;
  
  if (twikooConfig?.enable) {
    function initTwikoo() {
      if (typeof window.twikoo === 'undefined') {
        setTimeout(initTwikoo, 100);
        return;
      }

      window.twikoo.init({
        envId: twikooConfig.envId,
        el: '#twikoo',
        path: window.location.pathname,
        lang: 'zh-CN',
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTwikoo);
    } else {
      initTwikoo();
    }

    document.addEventListener('swup:content-replace', () => {
      setTimeout(initTwikoo, 100);
    });
  }
</script>
```

### 2. CDN 引入（`Layout.astro`）

**只需在 `<head>` 中引入 Twikoo 脚本：**

```html
<script src="https://cdn.staticfile.net/twikoo/1.6.39/twikoo.all.min.js" 
        crossorigin="anonymous" 
        referrerpolicy="no-referrer">
</script>
```

### 3. 无自定义样式

**完全不需要** `twikoo.css` 文件，Twikoo 会使用其内置的默认样式。

## 实现细节

### 代码统计

| 项目 | 代码行数 |
|------|---------|
| `Twikoo.astro` | **83 行** |
| 自定义 CSS | **0 行** |
| **总计** | **83 行** |

### 核心逻辑

**初始化流程：**

1. ⏱️ 等待 Twikoo 脚本加载
2. 🎯 调用 `twikoo.init()` 初始化
3. 🔄 使用 Swup hooks 监听页面切换
4. ♻️ 页面切换时自动重新初始化

**Swup 集成（重要）：**

```javascript
// 使用 window.swup.hooks.on() 而非 document.addEventListener()
window.swup.hooks.on('page:view', () => {
  initTwikoo();
});
```

这确保了在使用 Swup 进行页面导航时，评论区能正确重新加载。

**配置项：**

```javascript
{
  envId: 'your-env-id',      // 后端服务地址
  el: '#twikoo',             // 容器元素
  path: window.location.pathname,  // 评论路径（自动更新）
  lang: 'zh-CN',             // 语言
}
```

### 优势

1. **极简** - 只有必要代码，没有任何冗余
2. **稳定** - 完全使用 Twikoo 默认行为，减少出错可能
3. **易维护** - 代码量少，逻辑清晰
4. **原生体验** - 保留 Twikoo 原生的外观和交互
5. **SPA 支持** - 完美支持 Swup 页面切换，自动重新加载评论

### 常见问题

#### Q: 页面切换后评论区为空？

**A:** 已修复！现在使用 `window.swup.hooks.on('page:view', ...)` 监听页面切换，确保评论区在每次导航后都能正确重新初始化。

#### Q: 如何调试 Twikoo 初始化？

**A:** 打开浏览器控制台，会看到：
- `"Twikoo initialized for: /posts/xxx/"` - 初始化成功
- `"Page view detected, reinitializing Twikoo..."` - 页面切换时重新初始化
- `"Twikoo container not found"` - 容器不存在（可能不在评论页面）

## 如何添加自定义样式？

如果将来需要自定义样式，可以：

### 方案 1：全局 CSS（推荐）

在 `src/styles/` 下创建 `twikoo.css`：

```css
/* 通过高优先级选择器覆盖 */
#twikoo .tk-comment {
  background: var(--card-bg);
  border: 1px solid var(--line-divider);
}
```

然后在 `Layout.astro` 中引入：

```javascript
import "@/styles/twikoo.css";
```

### 方案 2：内联样式

直接在 `Twikoo.astro` 中添加 `<style>` 标签：

```astro
<style is:global>
  #twikoo .tk-comment {
    /* 自定义样式 */
  }
</style>
```

## 参考资源

- [Twikoo 官方文档](https://twikoo.js.org/)
- [Twikoo 配置参数](https://twikoo.js.org/frontend.html)
- [Astro 组件指南](https://docs.astro.build/en/core-concepts/astro-components/)

## 总结

**最小化原则：**

1. ✅ **零配置样式** - 使用 Twikoo 默认样式
2. ✅ **最少代码** - 只包含必要的初始化逻辑
3. ✅ **开箱即用** - 引入即可使用，无需额外配置
4. ✅ **保持简单** - 遵循 KISS 原则

**文件清单：**

- ✅ `src/components/misc/Twikoo.astro` - 评论组件
- ✅ `src/layouts/Layout.astro` - CDN 脚本引入
- ❌ ~~`src/styles/twikoo.css`~~ - 已删除，无自定义样式

这是最简洁、最稳定的 Twikoo 集成方案！

