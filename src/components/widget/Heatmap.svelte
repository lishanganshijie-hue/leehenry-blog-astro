<script lang="ts">
export let dates: string[] = [];
export let cell = 10;
export let gap = 2;

const norm = (d: string) => {
	const dt = new Date(d);
	if (isNaN(dt.getTime())) return null;
	return dt.toISOString().slice(0, 10);
};

const allDays = Array.from(
	new Set(dates.map(norm).filter(Boolean) as string[]),
).sort();

function getWeek(iso: string): number {
	const d = new Date(iso + 'T00:00:00Z');
	const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.min(Math.floor((d.getTime() - start.getTime()) / (7 * 86400000)) + 1, 53);
}

const weekCounts = new Map<string, number>();
for (const d of allDays) {
	const key = `${d.slice(0, 4)}-${String(getWeek(d)).padStart(2, '0')}`;
	weekCounts.set(key, (weekCounts.get(key) ?? 0) + 1);
}

const years = Array.from(
	new Set(allDays.map((d) => Number(d.slice(0, 4)))),
).sort((a, b) => a - b);

const WEEKS = 53;
const WINDOW = 3;

// 默认显示最近 3 年
let windowEnd = years.length; // exclusive

$: visibleYears = years.slice(Math.max(0, windowEnd - WINDOW), windowEnd);

function toggle() {
	if (years.length <= WINDOW) return;
	// 往上滚动一年（显示更早的），到头后循环回最新
	windowEnd = windowEnd <= WINDOW ? years.length : windowEnd - 1;
}

function colorClass(n: number) {
	if (n <= 0) return 'lvl-0';
	if (n === 1) return 'lvl-1';
	if (n === 2) return 'lvl-2';
	if (n === 3) return 'lvl-3';
	return 'lvl-4';
}

function calcStreak(): number {
	let streak = 0;
	let cur = new Date();
	for (let i = 0; i < 200; i++) {
		const iso = cur.toISOString().slice(0, 10);
		const key = `${iso.slice(0, 4)}-${String(getWeek(iso)).padStart(2, '0')}`;
		if ((weekCounts.get(key) ?? 0) > 0) {
			streak++;
			cur = new Date(cur.getTime() - 7 * 86400000);
		} else {
			break;
		}
	}
	return streak;
}
const streak = calcStreak();

const weekLabelAt = new Set([1, 14, 27, 40, 53]);

const now = new Date();
const currentYear = now.getUTCFullYear();
const currentWeek = getWeek(now.toISOString().slice(0, 10));
</script>

<style>
  .hm {
    --fg: var(--card-fg, #0b0b0b);
    --muted: #6b7280;
  }
  :global(.dark) .hm {
    --fg: var(--card-fg, #f3f4f6);
    --muted: #9ca3af;
  }

  .card {
    padding: 24px 32px;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 8px;
  }
  .legend {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-family: var(--font-mono);
    color: var(--muted);
  }
  .legend-label { margin-right: 2px; }
  .chip {
    width: var(--cell);
    height: calc(var(--cell) * 1.5);
    border-radius: 0;
    flex-shrink: 0;
  }
  .streak {
    font-size: 14px;
    font-family: var(--font-sans);
    color: var(--primary);
    opacity: 0.75;
    white-space: nowrap;
  }

  .scroller {
    width: 100%;
  }

  .matrix {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  .year-label {
    font-size: 14px;
    font-family: var(--font-sans);
    color: var(--muted);
    width: 2.8rem;
    text-align: left;
    flex-shrink: 0;
    user-select: none;
  }
  .weeks-row {
    display: flex;
    gap: 0;
    flex: 1;
    min-width: 0;
  }

  .cell {
    flex: 1;
    height: calc(var(--cell) * 1.5);
    border-radius: 0;
    min-width: 0;
  }

  .week-label-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 2px;
    width: 100%;
  }
  .week-label-spacer {
    width: 2.8rem;
    flex-shrink: 0;
  }
  .week-labels {
    display: flex;
    gap: 0;
    flex: 1;
    min-width: 0;
  }
  .wl {
    flex: 1;
    font-size: 14px;
    font-family: var(--font-mono);
    color: rgb(0 0 0 / 0.3);
    text-align: center;
    min-width: 0;
    white-space: nowrap;
    overflow: visible;
    user-select: none;
  }
  :global(.dark) .wl {
    color: rgb(255 255 255 / 0.3);
  }
  .wl-first { text-align: left; }
  .wl-last { transform: translateX(-1rem); }

  /* 年份切换标签 */
  .year-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 16px;
    color: var(--muted);
    transition: color 0.2s;
  }
  .year-btn:hover { color: var(--primary); }

  /* 未来的周 */
  .future { opacity: 0.2; }

  /* 颜色 */
  .lvl-0 { background: var(--btn-regular-bg); }
  .lvl-1 { background: var(--primary); opacity: 0.35; }
  .lvl-2 { background: var(--primary); opacity: 0.55; }
  .lvl-3 { background: var(--primary); opacity: 0.75; }
  .lvl-4 { background: var(--primary); opacity: 1; }

  :global(.dark) .lvl-0 { background: var(--btn-regular-bg); }
  :global(.dark) .lvl-1 { background: var(--primary); opacity: 0.35; }
  :global(.dark) .lvl-2 { background: var(--primary); opacity: 0.55; }
  :global(.dark) .lvl-3 { background: var(--primary); opacity: 0.75; }
  :global(.dark) .lvl-4 { background: var(--primary); opacity: 1; }
</style>

<div class="hm" style={`--cell:${cell}px; --gap:${gap}px;`}>
  <div class="card card-base">

    <div class="toolbar">
      <div class="legend">
        {#each [0, 1, 2, 3, 4] as n}
          <div class={"chip lvl-" + (n >= 4 ? 4 : n)}></div>
          <span>{n >= 4 ? '4+' : n}</span>
        {/each}
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        {#if streak > 0}
          <span class="streak">{streak} week streak</span>
        {/if}
        {#if years.length > WINDOW}
          <button class="year-btn" on:click={toggle}>
            于 {visibleYears[0]} – {visibleYears[visibleYears.length - 1]} 散落
          </button>
        {/if}
      </div>
    </div>

    <div class="scroller">
      <div class="matrix">
        {#each visibleYears as y}
          <div class="row">
            <span class="year-label">{y}</span>
            <div class="weeks-row">
              {#each Array(WEEKS) as _, w}
                {@const count = weekCounts.get(`${y}-${String(w + 1).padStart(2, '0')}`) ?? 0}
                <div
                  class={"cell " + colorClass(count) + (y === currentYear && w + 1 > currentWeek ? ' future' : '')}
                  title={`${y} W${w + 1}：${count} 篇`}
                  aria-label={`${y} 第 ${w + 1} 周，${count} 篇`}
                ></div>
              {/each}
            </div>
          </div>
        {/each}

        <div class="week-label-row">
          <div class="week-label-spacer"></div>
          <div class="week-labels">
            {#each Array(WEEKS) as _, w}
              <span class={"wl" + (w === 0 ? ' wl-first' : '') + (w === WEEKS - 1 ? ' wl-last' : '')}>{weekLabelAt.has(w + 1) ? `W${w + 1}` : ''}</span>
            {/each}
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
