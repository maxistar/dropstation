<template>
  <div>
    <h1>Plants</h1>
    <PlantItem
      v-for="plant in deviceStore.plants"
      :key="plant.id"
      :device="plant"
      @edit="editPlant"
      @delete="deletePlant"
    />
    <v-btn @click="createPlant" color="primary"><v-icon icon="mdi-pen-plus" /> Create Plant</v-btn>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import PlantItem from '~/components/PlantItem.vue';

const router = useRouter();
const deviceStore = useDeviceStore();

useAsyncData('plants', async () => await deviceStore.fetchPlants());

const createPlant = () => {
  router.push('/plants/create');
};

const editPlant = (id: number) => {
  router.push(`/plants/${id}/edit`);
};

const deletePlant = async (id: number) => {
  await deviceStore.deletePlant(id);
};
</script>
