<script lang="ts">
  /** 输入：文章发布日期数组 ['YYYY-MM-DD'] */
  export let dates: string[] = [];

  /** 可调尺寸（默认接近 GitHub） */
  export let cell = 10;
  export let gap = 10;

  // —— 归一化与计数 ——
  const norm = (d: string) => {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    return dt.toISOString().slice(0, 10);
  };
  const allDays = Array.from(new Set(dates.map(norm).filter(Boolean) as string[])).sort();
  const counts = new Map<string, number>();
  for (const d of allDays) counts.set(d, (counts.get(d) ?? 0) + 1);

  // 年份
  const years = Array.from(new Set(allDays.map(d => Number(d.slice(0, 4))))).sort((a,b)=>a-b);
  let year = years.at(-1) ?? new Date().getFullYear();

  function colorClass(n: number) {
    if (n <= 0) return "lvl-0";
    return "lvl-1";
  }

  function makeWeeks(y: number) {
    const first = new Date(Date.UTC(y, 0, 1));
    const start = new Date(Date.UTC(y, 0, 1 - first.getUTCDay())); // 周日对齐
    const end = new Date(Date.UTC(y + 1, 0, 1));

    const weeks: { iso: string; inYear: boolean; count: number }[][] = [];
    let cur = new Date(start);
    while (cur < end || cur.getUTCDay() !== 0) {
      const iso = cur.toISOString().slice(0, 10);
      const inYear = cur.getUTCFullYear() === y && cur >= new Date(Date.UTC(y,0,1)) && cur < end;
      const count = counts.get(iso) ?? 0;

      if (cur.getUTCDay() === 0) weeks.push([]);
      weeks[weeks.length - 1].push({ iso, inYear, count });

      cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), cur.getUTCDate() + 1));
    }
    return weeks;
  }

  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  $: weeks = makeWeeks(year);

  /** 月份列标签 */
  function monthLabels(weeks: { iso: string }[][], y: number) {
    const out: { text: string; col: number }[] = [];
    let last = -1;
    for (let i = 0; i < weeks.length; i++) {
      const iso = weeks[i][0]?.iso;
      if (!iso) continue;
      const d = new Date(iso);
      if (d.getUTCFullYear() !== y) continue;
      const m = d.getUTCMonth();
      if (m !== last) {
        out.push({ text: M[m], col: i });
        last = m;
      }
    }
    return out;
  }
  $: labels = monthLabels(weeks, year);

  // —— 年份选择：按钮 + 浮层（站内同款动画） ——
  let open = false;
  function toggle() { open = !open; }
  function pick(y: number) { year = y; open = false; }
  function onDoc(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest?.(".hm-year")) open = false;
  }
  if (typeof window !== "undefined") document.addEventListener("click", onDoc);
</script>

<style>
  /* 主题变量（卡片保持原样，不动） */
  .hm {
    --fg: var(--card-fg, #0b0b0b);
    --muted: #6b7280;
  }
  :global(.dark) .hm {
    --fg: var(--card-fg, #f3f4f6);
    --muted: #9ca3af;
  }

  .card {
    /* 使用你站内 card-base 的视觉；这里只做内边距微调和圆角统一 */
    border-radius: 16px;
    padding: 16px 32px;
  }

  .toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .legend { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted); }
  .legend .chip { width: var(--cell); height: var(--cell); border-radius: 2px; }

  /* 月份标签：左右留白 */
  .months {
    display:grid;
    grid-auto-flow: column;
    grid-auto-columns: calc(var(--cell) + var(--gap));
    gap: var(--gap);
    font-size: 11px;
    color: var(--muted);
    padding: 4px 8px 2px;
    user-select: none;
  }
  .months .spacer { width: 8px; }

  .scroller { overflow-x:auto; scrollbar-width:none; padding: 0 8px 2px; }
  .scroller::-webkit-scrollbar { display:none; }

  .grid {
    display:grid;
    grid-auto-flow: column;
    grid-auto-columns: calc(var(--cell) + var(--gap));
    gap: var(--gap);
  }
  .week { display:grid; grid-template-rows: repeat(7, var(--cell)); gap: var(--gap); }

  .day { width: var(--cell); height: var(--cell); border-radius: 2px; }
  .dim { opacity: .15; }

  /* GitHub 绿阶（亮色） */
  .lvl-0 { background: #e2f0ff; }
  .lvl-1 { background: #3275b4; }

  /* GitHub 绿阶（暗色） */
  :global(.dark) .lvl-0 { background: #283747; }
  :global(.dark) .lvl-1 { background: #63b3ff; }

  /* 年份按钮 + 浮层（站内同款风格） */
  .hm-year { position: relative; }
  .year-btn {
    border: 1px solid var(--panel-border, rgba(0,0,0,.08));
    background: transparent;
    color: var(--fg);
    border-radius: 10px;
    height: 2.25rem;
    padding: 0 0.75rem;
    display:flex; align-items:center; gap:.35rem;
    cursor: pointer;
    transition: transform .08s ease;
  }
  .year-btn:active { transform: scale(.97); }

  .menu {
    position: absolute; right: 0; top: calc(100% + 8px);
    min-width: 7rem;
    border: 1px solid var(--panel-border, rgba(0,0,0,.08));
    background: var(--card-bg, #fff);
    color: var(--fg);
    border-radius: 12px;
    padding: 6px;
    box-shadow: 0 6px 24px rgba(0,0,0,.08);
    transform-origin: top right;
    transition: transform .12s ease, opacity .12s ease;
  }
  .menu.hide { opacity: 0; transform: scale(.98) translateY(-4px); pointer-events: none; }
  .menu.show { opacity: 1; transform: scale(1) translateY(0); }
  .menu button {
    width: 100%; text-align: left;
    border-radius: 8px; padding: 8px 10px;
    cursor: pointer; border: none; background: transparent; color: inherit;
  }
  .menu button:hover { background: rgba(0,0,0,.05); }
  :global(.dark) .menu { background: var(--card-bg, #0f1115); box-shadow: 0 6px 24px rgba(0,0,0,.35); }
  :global(.dark) .menu button:hover { background: rgba(255,255,255,.06); }


    /* 左右布局容器 */
    .hm-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;            /* 左右间距 */
    }

    /* 左侧图表区域自适应占满；避免被右侧挤压 */
    .hm-graph {
    flex: 1;
    min-width: 0;         /* 允许内部横向滚动 */
    }

    /* 右侧年份选择器对齐顶部，留一点内缩 */
    .hm-year {
    position: relative;
    margin-left: 4px;
    }

    /* 小屏自动改回上下排，年份按钮靠右 */
    @media (max-width: 640px) {
    .hm-row { flex-direction: column; gap: 12px; }
    .hm-year { align-self: flex-end; }
    }

</style>

<div class="hm" style={`--cell:${cell}px; --gap:${gap}px;`}>
  <div class="card card-base hm-card" style="overflow: visible;">

    <!-- 左右排：左=图表，右=年份选择 -->
    <div class="hm-row">
      <!-- 左侧：月份 + 网格 -->
      <div class="hm-graph">
        <!-- 月份标签 -->
        <div class="months" aria-hidden="true">
          <span class="spacer"></span>
          {#each Array(weeks.length) as _, i}
            {#if labels.find(l => l.col === i)}
              <span>{labels.find(l => l.col === i)?.text}</span>
            {:else}
              <span></span>
            {/if}
          {/each}
          <span class="spacer"></span>
        </div>

        <!-- 网格 -->
        <div class="scroller">
          <div class="grid">
            {#each weeks as w}
              <div class="week">
                {#each w as c}
                  <div
                    class={"day " + (c.inYear ? "" : "dim") + " " + colorClass(c.count)}
                    title={`${c.iso}：${c.count} 篇`}
                    aria-label={`${c.iso}，${c.count} 篇`}
                  />
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- 右侧：年份选择器 -->
      <div class="hm-year">
        <button
          class="year-btn btn-plain scale-animation"
          on:click={toggle}
          aria-haspopup="menu"
          aria-expanded={open ? "true" : "false"}
        >
          {year}<span style="opacity:.55">▾</span>
        </button>
        <div class={"menu " + (open ? "show" : "hide")} role="menu">
          {#each [...years].reverse() as y}
            <button role="menuitem" on:click={() => pick(y)}>{y}</button>
          {/each}
        </div>
      </div>
    </div>

  </div>
</div>

