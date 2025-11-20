<script lang="ts">
  import { onMount } from 'svelte';
  import { subscribeJokeState, setJokeActive } from '$lib/jokeState';

  let isJoke = $state(false);
  let adminUnlocked = $state(false);
  let passwordInput = $state('');
  let audioEnabled = $state(false);
  let permissionAsked = $state(false);

  let audioEl: HTMLAudioElement | null = null;

  function ensureAudio() {
    if (!audioEl) {
      audioEl = new Audio('/sound.mp3');
      audioEl.loop = true;
    }
    return audioEl;
  }

  function enableSound() {
    try {
      const el = ensureAudio();
      el.currentTime = 0;
      el.volume = 1;
      el.play().then(() => {
        audioEnabled = true;
        localStorage.setItem('audioEnabled', '1');
        console.info('[Audio] enabled');
      }).catch((e) => console.warn('[Audio] play blocked', e));
    } catch (e) {
      console.error('[Audio] error', e);
    }
  }

  function maybePlayOrPause() {
    const el = ensureAudio();
    if (isJoke && audioEnabled) {
      el.play().catch(() => {});
    } else {
      el.pause();
      if (!isJoke) el.currentTime = 0;
    }
  }

  async function unlockAdmin() {
    if (passwordInput === 'jester123') {
      adminUnlocked = true;
      localStorage.setItem('adminUnlocked', '1');
      console.info('[Admin] unlocked');
    } else {
      adminUnlocked = false;
    }
  }

  async function startJoke() {
    await setJokeActive(true);
  }
  async function stopJoke() {
    await setJokeActive(false);
  }

  async function notifyIfAllowed() {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'default' && !permissionAsked) {
        permissionAsked = true;
        await Notification.requestPermission();
      }
      if (Notification.permission === 'granted') {
        const reg = await navigator.serviceWorker.getRegistration();
        reg?.active?.postMessage({ type: 'SHOW_JOKE_NOTIFICATION' });
      }
    } catch (e) {
      console.warn('[Notify] failed', e);
    }
  }

  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    // restore flags
    adminUnlocked = localStorage.getItem('adminUnlocked') === '1';
    audioEnabled = localStorage.getItem('audioEnabled') === '1';
    const stop = subscribeJokeState((state) => {
      const prev = isJoke;
      isJoke = !!state.active;
      console.info('[Joke] state', isJoke);
      maybePlayOrPause();
      if (!prev && isJoke) {
        notifyIfAllowed();
        // attempt massive vibration if supported
        if (navigator.vibrate) {
          navigator.vibrate([500, 200, 500, 200, 1000]);
        }
      }
    });
    unsubscribe = stop;
    return () => {
      unsubscribe?.();
    };
  });

  $effect(() => {
    maybePlayOrPause();
  });
</script>

<main class:is-joke={isJoke}>
  <section class="center">
    {#if isJoke}
      <div class="joke">
        JOKE
      </div>
      {#if !audioEnabled}
        <button class="btn primary" on:click={enableSound}>Enable sound</button>
      {/if}
    {:else}
      <div class="idle">idle</div>
      <p class="hint">Install the app and enable sound to be ready.</p>
      {#if !audioEnabled}
        <button class="btn" on:click={enableSound}>Enable sound</button>
      {/if}
    {/if}
  </section>

  <section class="admin">
    {#if !adminUnlocked}
      <div class="admin-box">
        <input
          placeholder="enter admin password"
          type="password"
          bind:value={passwordInput}
          on:change={unlockAdmin}
        />
        <button class="btn" on:click={unlockAdmin}>Unlock</button>
      </div>
    {:else}
      <div class="admin-box">
        <div class="row">
          <button class="btn danger" disabled={isJoke} on:click={startJoke}>Start JOKE</button>
          <button class="btn" disabled={!isJoke} on:click={stopJoke}>Stop JOKE</button>
        </div>
        <div class="row">
          <button class="btn" on:click={() => (adminUnlocked = false)}>Lock</button>
        </div>
      </div>
    {/if}
  </section>
</main>

<style>
  main {
    min-height: 100dvh;
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 12px;
  }
  .center {
    display: grid;
    place-items: center;
  }
  .joke {
    font-size: 22vw;
    font-weight: 900;
    text-transform: uppercase;
    animation: flash 0.4s infinite steps(2, end);
    letter-spacing: 2vw;
    text-shadow: 0 0 10px #fff, 0 0 20px #fff;
  }
  .idle {
    opacity: 0.6;
    font-size: 12vw;
    letter-spacing: 1vw;
  }
  .hint {
    margin-top: -24px;
    opacity: 0.6;
  }

  .admin {
    padding: 12px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .admin-box {
    display: grid;
    gap: 8px;
  }
  .row {
    display: flex;
    gap: 8px;
  }
  input {
    background: #111;
    color: #fff;
    border: 1px solid #333;
    padding: 10px 12px;
    border-radius: 8px;
    width: 100%;
  }
  .btn {
    background: #222;
    color: #fff;
    border: 1px solid #444;
    padding: 10px 16px;
    border-radius: 999px;
    font-weight: 600;
  }
  .btn.primary {
    background: #0ea5e9;
    border-color: #0ea5e9;
    color: #000;
  }
  .btn.danger {
    background: #ef4444;
    border-color: #ef4444;
    color: #000;
  }
  .btn:disabled {
    opacity: 0.5;
  }

  @keyframes flash {
    0% { background: #000; color: #fff; }
    50% { background: #fff; color: #000; }
    100% { background: #000; color: #fff; }
  }
  .is-joke {
    animation: bg 0.4s infinite steps(2, end);
  }
  @keyframes bg {
    0% { background: #000; }
    50% { background: #fff; }
    100% { background: #000; }
  }
</style>
