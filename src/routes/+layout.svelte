<script lang="ts">
  import { onMount } from 'svelte';

  onMount(async () => {
    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/service-worker.js');
        console.info('[PWA] Service worker registered');
      }
    } catch (err) {
      console.error('[PWA] SW registration failed', err);
    }
  });
</script>

<slot />

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
    background: #000;
    color: #fff;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  }
</style>

