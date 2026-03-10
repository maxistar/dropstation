<template>
  <div>
    <h1>Points</h1>
    <PointItem
        v-for="point in deviceStore.points"
        :key="point.id"
        :device="point"
        @edit="editPoint"
        @delete="deletePoint"
    />
    <v-btn @click="createPoint" color="primary"><v-icon icon="mdi-pen-plus" /> Create Point</v-btn>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import PointItem from '~/components/PointItem.vue';

const router = useRouter();
const deviceStore = useDeviceStore();

useAsyncData('points', async () => await deviceStore.fetchPoints());

const createPoint = () => {
  router.push('/points/create');
};

const editPoint = (id: number) => {
  router.push(`/points/${id}/edit`);
};

const deletePoint = async (id: number) => {
  await deviceStore.deletePoint(id);
};

</script>
