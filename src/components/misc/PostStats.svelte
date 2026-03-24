<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';

  const LIKES_API   = 'https://twikoo.leehenry.top/likes/';
  const TWIKOO_API  = 'https://twikoo.leehenry.top/';

  interface Props { path: string }
  const { path }: Props = $props();

  let likes    = $state<number | null>(null);
  let comments = $state<number | null>(null);

  onMount(async () => {
    const [likesRes, commentsRes] = await Promise.allSettled([
      fetch(`${LIKES_API}?path=${encodeURIComponent(path)}`).then(r => r.json()),
      fetch(TWIKOO_API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ event: 'GET_COMMENTS_COUNT', urls: [path] }),
      }).then(r => r.json()),
    ]);

    if (likesRes.status === 'fulfilled')    likes    = likesRes.value?.count    ?? 0;
    if (commentsRes.status === 'fulfilled') comments = commentsRes.value?.data?.[0]?.count ?? 0;
  });
</script>

<a href={`${path}#like-button`} class="stat-link font-mono text-30 inline-flex items-center gap-1">
  <Icon icon="material-symbols:favorite-outline-rounded" class="text-base" />
  {likes == null ? '—' : likes}
</a>
<span class="text-30">·</span>
<a href={`${path}#tcomment`} class="stat-link font-mono text-30 inline-flex items-center gap-1">
  <Icon icon="material-symbols:chat-bubble-outline-rounded" class="text-base" />
  {comments == null ? '—' : comments}
</a>

<style>
  .stat-link {
    transition: color 0.15s;
    text-decoration: none;
  }
  .stat-link:hover {
    color: var(--primary);
  }
</style>
