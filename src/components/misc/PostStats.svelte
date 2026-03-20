<script lang="ts">
  import { onMount } from 'svelte';

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

<span class="font-mono text-30">{likes == null ? '—' : `${likes} ${likes === 1 ? 'like' : 'likes'}`}</span>
<span class="text-30">·</span>
<span class="font-mono text-30">{comments == null ? '—' : `${comments} ${comments === 1 ? 'reply' : 'replies'}`}</span>
