---
title: Markdown 样式测试
published: 2025-01-01
description: Markdown 支持特性全览。
image: "./cover.jpeg"
tags: ["Markdown"]
category: 野语不成篇
draft: false
---

# 一级标题

段落之间用空行分隔。



第二段。

_The italic style of English_ renders normally，而*中文斜体语法* 将渲染为着重号。还可以用**粗体**来高亮强调。这是等宽 `mono 字体`。还有 Unicode 支持 ☺ 。

## 二级标题

> 块引用这样写。
>
> 可以跨多个段落。
>
> - 引用内的列表项 1
>
> - 块引用的列表项 2
>
>   嵌套段落文字
>
>   - 多级列表项

无序列表：

- 第一项
- 第二项
- 第三项

有序列表：

1. 首先准备食材：
   - 胡萝卜
   - 芹菜
   - 扁豆
2. 烧一锅水。
3. 把所有材料倒入锅中，按以下步骤操作：

       找到木勺
       揭开锅盖
       搅拌
       盖上锅盖
       等待 10 分钟

   注意不要碰翻木勺。

### 三级标题

这里有一个 [网站链接](http://foo.bar)、一个 [本地文档](local-doc.html)、以及一个 [跳转到二级标题](#二级标题) 的锚点链接。还有一个脚注 [^1]。

[^1]: 脚注内容写在这里。

表格示例：

| 分类     |     商品 [^1]      | 价格（￥） |
| -------- | :----------------: | ---------: |
| 音频设备 | Edifier M230 音箱  |   `349.12` |
| 笔记本   | 联想 ThinkBook 14+ |  `5299.99` |
| 存储设备 |  希捷机械硬盘 4TB  |   `598.00` |

---

#### 四级标题

行内数学公式：$\omega = d\phi / dt$。显示数学公式独占一行，用双美元符号：

$$I = \int \rho R^{2} dV$$

$$
\begin{equation*}
\pi = 3.14159265358979323846\ldots
\end{equation*}
$$

## 折叠块

:::fold{summary="W 君对计划的理解"}

W 君把「计划」这件事分解得更细致了一些：

1. **被动计划**。比如考研、四六级、毕业论文，这种被动的 DDL，必须要设置计划；
2. **主动兴趣**。能凭借兴趣废寝忘食地主动研究下去自然是最好，然而大多数人是懒散的，所以也需要借助计划的力量。

:::

## 提示块

```markdown
:::note
用户在浏览时也应注意的信息。
:::
```

:::note
用户在浏览时也应注意的信息。
:::

:::tip
帮助用户更好完成任务的可选信息。
:::

:::important
用户成功所必须了解的关键信息。
:::

:::warning
需要用户立即关注的重要内容。
:::

:::caution
某操作可能带来的负面后果。
:::

```markdown
:::note[自定义标题]
这是一条带有自定义标题的提示。
:::
```

:::note[自定义标题]
这是一条带有自定义标题的提示。
:::

```markdown
> [!NOTE]
> 同样支持 [GitHub 提示块语法](https://github.com/orgs/community/discussions/16925)。
```

> [!NOTE]
> 同样支持 [GitHub 提示块语法](https://github.com/orgs/community/discussions/16925)。

## 代码块

```js
console.log('一般语法高亮示例')
```

```js title="示例文件.js"
console.log('编辑器窗口标题示例')
```

```html
<!-- src/content/index.html -->
<div>文件名注释示例</div>
```

```bash
echo "无标题终端窗口"
```

```powershell title="PowerShell 终端示例"
Write-Output "带标题的终端窗口"
```

```sh frame="none"
echo "无边框终端代码块"
```

```js {1, 4, 7-8}
// 第 1 行 — 整行与范围行标记示例
// 第 2 行
// 第 3 行
// 第 4 行 — 按行号标记
// 第 5 行
// 第 6 行
// 第 7 行 — 范围 7-8
// 第 8 行 — 范围 7-8
```

```js title="插入与删除行标记示例.js" del={2} ins={3-4} {6}
function demo() {
  console.log('此行标记为已删除')
  // 以下两行标记为已插入
  console.log('第二行插入内容')

  return '此行使用默认中性标记'
}
```

```jsx {"1":5} del={"2":7-8} ins={"3":10-12}
// labeled-line-markers.jsx

// 带标签的行标记示例
<button
  role="button"
  {...props}
  value={value}
  className={buttonClassName}
  disabled={disabled}
  active={active}
>
  {children &&
    !active &&
    (typeof children === 'string' ? <span>{children}</span> : children)}
</button>
```

```diff
+Diff 语法 示例
+此行标记为已插入
-此行标记为已删除
这是普通行
```

```diff lang="js"
  function thisIsJavaScript() {
-   console.log('Diff + 语法高亮组合示例')
-   console.log('旧代码')
+   console.log('新代码')
  }
```

```js "指定文字"
function demo() {
  // 标记行内任意指定文字示例
  return '支持同一文字的多处匹配';
}
```

```ts /ye[sp]/
console.log('正则表达式标记：/ye[sp]/')
console.log('yes 和 yep 这两个词将被标记。')
```

```js "return true;" ins="已插入" del="已删除"
function demo() {
  console.log('行内插入与删除标记示例');
  return true;
}
```

```js wrap
// 自动换行示例
function getLongString() {
  return '这是一段很长的字符串，在容器较窄时将自动换行而不会超出代码块边界范围'
}
```



```js collapse={1-5, 12-14, 21-24}
// 以下样板代码将被折叠
import { someBoilerplateEngine } from '@example/some-boilerplate'
import { evenMoreBoilerplate } from '@example/even-more-boilerplate'

const engine = someBoilerplateEngine(evenMoreBoilerplate())

// 折叠代码段示例：此部分代码默认展示
engine.doSomething(1, 2, 3, calcFn)

function calcFn() {
  // 多段折叠示例
  const a = 1
  const b = 2
  const c = a + b

  // 此行保持可见
  console.log(`计算结果：${a} + ${b} = ${c}`)
  return c
}

// 以下代码再次折叠
engine.closeConnection()
engine.freeMemory()
engine.shutdown({ reason: '示例结束' })
```

```js showLineNumbers
// 显示行号示例：显示默认行号
console.log('来自第 2 行的问候！')
console.log('我在第 3 行')
```

```js showLineNumbers startLineNumber=5
// 显示行号示例：从指定行号开始
console.log('来自第 6 行的问候！')
console.log('我在第 7 行')
```

## GitHub 仓库卡片

```markdown
::github{repo="saicaca/fuwari"}
```

::github{repo="saicaca/fuwari"}

## 音乐卡片

仅 `query` 定位：

```markdown
::music{query="梅雨季"}
```

::music{query="梅雨季"}

通过 `query` + `artist` 定位：

```markdown
::music{query="吉他手" artist="陈绮贞"}
```

::music{query="吉他手" artist="陈绮贞"}

通过 `query` + `album` 定位：

```markdown
::music{query="晴天" album="叶惠美"}
```

::music{query="晴天" album="叶惠美"}

默认为单曲卡片，通过 `type="album"` 指定为专辑卡片：

```markdown
::music{query="Go With The Flow" artist="A-Yue Chang" type="album"}
```

::music{query="Go With The Flow" artist="A-Yue Chang" type="album"}

iTunes ID `id` 精准定位：

```markdown
::music{id="1524793738" type="album"}
```

::music{id="1524793738" type="album"}

国家字段 `country` 切换商店地区，默认 `cn`：

```markdown
::music{query="Creep" artist="Radiohead" country="us"}
```

::music{query="Creep" artist="Radiohead" country="us"}

支持完全离线的手动模式：

```markdown
::music{title="标题" artist="歌手" cover="https://..." preview="https://..." link="https://..."}
```

## 嵌入视频

```yaml
<iframe width="100%" height="468" src="https://www.youtube.com/embed/5gIf0_xpFPI" allowfullscreen></iframe>
```

### YouTube

<iframe width="100%" height="468" src="https://www.youtube.com/embed/5gIf0_xpFPI?si=N1WTorLKL0uwLsU_" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

### Bilibili

<iframe width="100%" height="468" src="//player.bilibili.com/player.html?bvid=BV1fK4y1s7Qf&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
