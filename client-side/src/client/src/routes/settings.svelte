<script lang="ts">
    import { onMount } from 'svelte';

    let settings = {
        sleepDuration: 0,
        wateringPin: 0,
        wateringDuration: 0,
        ipAddress: '',
        mdnsName: ''
    };

    onMount(async () => {
        const res = await fetch('/api/settings');
        settings = await res.json();
    });

    async function saveSettings() {
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
    }
</script>

<main>
    <h1>Settings</h1>
    <form on:submit|preventDefault={saveSettings} class="settings-form">
        <label>
            Sleep Duration (seconds):
            <input type="number" bind:value={settings.sleepDuration}>
        </label>
        <label>
            Watering Pin:
            <input type="number" bind:value={settings.wateringPin}>
        </label>
        <label>
            Watering Duration (seconds):
            <input type="number" bind:value={settings.wateringDuration}>
        </label>
        <label>
            IP Address:
            <input type="text" bind:value={settings.ipAddress}>
        </label>
        <label>
            mDNS Name:
            <input type="text" bind:value={settings.mdnsName}>
        </label>
        <button type="submit">Save Settings</button>
    </form>
</main>

<style>
    .settings-form label {
        display: flex;
        justify-content: space-between;
    }
    .settings-form input {
        width: 50%;
    }
</style>
