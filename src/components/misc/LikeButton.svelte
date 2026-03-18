<script lang="ts">
  const API = 'https://twikoo.leehenry.top/likes/';

  let count = $state(0);
  let liked = $state(false);
  let loading = $state(true);
  let animating = $state(false);

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const storageKey = `liked:${path}`;

  async function fetchCount() {
    try {
      const r = await fetch(`${API}?path=${encodeURIComponent(path)}`);
      const data = await r.json();
      count = data.count ?? 0;
    } catch {}
    liked = !!localStorage.getItem(storageKey);
    loading = false;
  }

  async function handleLike() {
    if (liked || loading) return;
    animating = true;
    setTimeout(() => { animating = false; }, 500);
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      const data = await r.json();
      count = data.count;
      if (data.ok !== false) {
        liked = true;
        localStorage.setItem(storageKey, '1');
      }
    } catch {}
  }

  $effect(() => { fetchCount(); });
</script>

<div class="like-wrapper">
  <button
    class="like-btn"
    class:liked
    class:animating
    onclick={handleLike}
    disabled={liked || loading}
    aria-label="为这篇文章点赞"
  >
    <svg viewBox="0 0 24 24" class="like-icon" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
    <span class="like-count">{loading ? '·' : count}</span>
  </button>
</div>

<style>
  .like-wrapper {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
  }

  .like-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 1.1rem;
    border: 1px solid var(--btn-card-bg-active);
    background: transparent;
    color: var(--btn-content);
    border-radius: 0;
    cursor: pointer;
    font-size: 0.9rem;
    opacity: 0.7;
    transition: border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;
    user-select: none;
  }

  .like-btn:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
    opacity: 1;
  }

  .like-btn.liked {
    border-color: var(--primary);
    color: var(--primary);
    opacity: 1;
    cursor: default;
  }

  .like-btn:disabled:not(.liked) {
    cursor: default;
  }

  .like-icon {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .like-btn.animating .like-icon {
    transform: scale(1.5);
  }

  .like-count {
    min-width: 1.5ch;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
</style>
