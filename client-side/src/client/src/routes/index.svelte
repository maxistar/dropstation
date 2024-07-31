<script lang="ts">
    import { onMount } from 'svelte';
    
    let status = { battery: 0, soilMoisture: 0, lastWatering: '' };
    
    onMount(async () => {
        const res = await fetch('/api/status');
        status = await res.json();
    });
    
    async function waterPlant() {
        await fetch('/api/water', { method: 'POST' });
    }
    </script>
    
    <main>
        <h1>Watering System</h1>
        <p>Battery: {status.battery}%</p>
        <p>Soil Moisture: {status.soilMoisture}%</p>
        <p>Last Watering: {status.lastWatering}</p>
        <button on:click={waterPlant}>Water the plant</button>
    </main>
    