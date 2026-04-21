<script lang="ts">
import Icon from "@iconify/svelte";
import { onDestroy } from "svelte";
export let entries: { date: string; words: number }[] = [];
export let cell = 10;
export let gap = 2;

function getWeek(iso: string): number {
	const d = new Date(`${iso}T00:00:00Z`);
	const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.min(
		Math.floor((d.getTime() - start.getTime()) / (7 * 86400000)) + 1,
		53,
	);
}

// 每年每周的总字数
const weekWords = new Map<string, number>();
for (const { date, words } of entries) {
	const iso = date.slice(0, 10);
	const key = `${iso.slice(0, 4)}-${String(getWeek(iso)).padStart(2, "0")}`;
	weekWords.set(key, (weekWords.get(key) ?? 0) + words);
}

const years = Array.from(
	new Set(entries.map((e) => Number(e.date.slice(0, 4)))),
).sort((a, b) => a - b);

const WEEKS = 53;
const WINDOW = 3;

let windowEnd = years.length;

$: visibleYears = years.slice(Math.max(0, windowEnd - WINDOW), windowEnd);

function toggle() {
	if (years.length <= WINDOW) return;
	windowEnd = windowEnd <= WINDOW ? years.length : windowEnd - 1;
}

// 按字数分级：0 / <3k / <6k / <9k / 9k+
function colorClass(w: number) {
	if (w <= 0) return "lvl-0";
	if (w < 3000) return "lvl-1";
	if (w < 6000) return "lvl-2";
	if (w < 9000) return "lvl-3";
	return "lvl-4";
}

function calcStreak(): number {
	let streak = 0;
	let cur = new Date();
	for (let i = 0; i < 200; i++) {
		const iso = cur.toISOString().slice(0, 10);
		const key = `${iso.slice(0, 4)}-${String(getWeek(iso)).padStart(2, "0")}`;
		if ((weekWords.get(key) ?? 0) > 0) {
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

// Tooltip mounted directly to document.body to escape transform ancestors
let tipEl: HTMLElement | null = null;

function ensureTip(): HTMLElement {
	if (!tipEl) {
		tipEl = document.createElement("div");
		tipEl.className = "hm-tip";
		tipEl.style.visibility = "hidden";
		document.body.appendChild(tipEl);
	}
	return tipEl;
}

function showTip(e: MouseEvent, text: string) {
	const el = ensureTip();
	const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
	el.style.left = `${rect.left + rect.width / 2}px`;
	el.style.top = `${rect.top}px`;
	el.textContent = text;
	el.style.visibility = "visible";
	el.style.opacity = "1";
}

function hideTip() {
	if (tipEl) {
		tipEl.style.opacity = "0";
		tipEl.style.visibility = "hidden";
	}
}

onDestroy(() => {
	tipEl?.remove();
	tipEl = null;
});
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
    font-family: var(--font-sans);
    color: var(--muted);
  }
  .legend-label { margin-right: 2px; font-weight: 700; color: rgb(0 0 0 / 0.75); }
  :global(.dark) .legend-label { color: rgb(255 255 255 / 0.75); }
  .chip {
    width: var(--cell);
    height: var(--cell);
    border-radius: 0;
    flex-shrink: 0;
  }
  .year-trigger {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    line-height: 1;
  }
  :global(.year-trigger-icon) {
    width: 16px;
    height: 16px;
    color: var(--btn-content);
    opacity: 0.45;
    transition: opacity 0.2s ease-in-out;
    pointer-events: none;
    flex-shrink: 0;
  }
  .year-trigger:hover :global(.year-trigger-icon) {
    opacity: 1;
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
    font-family: var(--font-mono);
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
    /* filter: url(#xerox); */
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
    font-size: 10.4px;
    line-height: 1;
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
  .wl-last { transform: translateX(-0.3rem); }

  /* 未来的周 */
  .future { opacity: 0.2; }

  /* Global cell tooltip — fixed so it escapes the SVG filter */
  :global(.hm-tip) {
    position: fixed;
    transform: translate(-50%, calc(-100% - 6px));
    padding: 0.3rem 0.6rem;
    background: var(--card-bg);
    color: var(--btn-content);
    border: 1px solid var(--btn-card-bg-active);
    border-radius: var(--radius-medium);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    font-size: 0.8rem;
    font-family: var(--font-sans);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.18s ease-in-out, visibility 0.18s ease-in-out;
    z-index: 9999;
  }

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
      <div style="display:flex; align-items:center; gap:6px;">
        <span class="legend-label">Words per week</span>
        {#if years.length > WINDOW}
          <button class="year-trigger" on:click={toggle} aria-label="切换年份">
            <Icon icon="material-symbols:history" class="year-trigger-icon" />
          </button>
        {/if}
      </div>
      <div class="legend">
        <span>Less</span>
        {#each [0, 1, 2, 3, 4] as n}
          <div class={"chip lvl-" + n}></div>
        {/each}
        <span>More</span>
      </div>
    </div>

    <div class="scroller">
      <div class="matrix">
        {#each visibleYears as y}
          <div class="row">
            <span class="year-label">{y}</span>
            <div class="weeks-row">
              {#each Array(WEEKS) as _, w}
                {@const words = weekWords.get(`${y}-${String(w + 1).padStart(2, '00')}`) ?? 0}
                <div
                  class={"cell " + colorClass(words) + (y === currentYear && w + 1 > currentWeek ? ' future' : '')}
                  aria-label={`${y} 第 ${w + 1} 周，${words} 字`}
                  on:mouseenter={(e) => showTip(e, `${y} W${w + 1} · ${words} 字`)}
                  on:mouseleave={hideTip}
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

