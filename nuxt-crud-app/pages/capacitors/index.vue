<template>
  <div>
    <h1>Capacitors</h1>
    <CapacitorItem
        v-for="device in deviceStore.capacitors"
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
import CapacitorItem from "~/components/CapacitorItem.vue";

const router = useRouter();
const deviceStore = useDeviceStore();

useAsyncData('capacitors', async () => await deviceStore.fetchCapacitors(), {
  initialCache: false
});

</script>
