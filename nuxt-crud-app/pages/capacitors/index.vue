<template>
  <div>
    <h1>Capacitors</h1>
    <CapacitorItem
        v-for="capacitor in deviceStore.capacitors"
        :key="capacitor.id"
        :device="capacitor"
        @edit="editCapacitor"
        @delete="deleteCapacitor"
    />
    <v-btn @click="createCapacitor" color="primary"><v-icon icon="mdi-pen-plus" /> Create Capacitor</v-btn>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import { VBtn } from 'vuetify/components';
import CapacitorItem from "~/components/CapacitorItem.vue";

const router = useRouter();
const deviceStore = useDeviceStore();

useAsyncData('capacitors', async () => await deviceStore.fetchCapacitors(), {
  initialCache: false
});

const createCapacitor = () => {
  router.push('/capacitors/create');
};

const editCapacitor = (id: number) => {
  router.push(`/capacitors/${id}/edit`);
};

const deleteCapacitor = async (id: number) => {
  await deviceStore.deleteCapacitor(id);
};
</script>
