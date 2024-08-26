<template>
  <div>
    <h1>Places</h1>
    <DeviceItem
        v-for="device in deviceStore.places"
        :key="device.id"
        :device="device"
        @edit="editDevice"
        @delete="deleteDevice"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import DeviceItem from '~/components/DeviceItem.vue';
import { VBtn } from 'vuetify/components';
import { storeToRefs } from 'pinia'

const router = useRouter();
const deviceStore = useDeviceStore();

useAsyncData('places', async () => await deviceStore.fetchPlaces(), {
  initialCache: false
});
</script>
