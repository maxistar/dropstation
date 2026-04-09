<template>
  <div>
    <h1>Places</h1>
    <PlaceItem
        v-for="place in deviceStore.places"
        :key="place.id"
        :device="place"
        @edit="editPlace"
        @delete="deletePlace"
    />
    <v-btn @click="createPlace" color="primary"><v-icon icon="mdi-pen-plus" /> Create Place</v-btn>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import PlaceItem from '~/components/PlaceItem.vue';
import { VBtn } from 'vuetify/components';

const router = useRouter();
const deviceStore = useDeviceStore();

useAsyncData('places', async () => await deviceStore.fetchPlaces(), {
  initialCache: false
});

const createPlace = () => {
  router.push('/places/create');
};

const editPlace = (id: number) => {
  router.push(`/places/${id}/edit`);
};

const deletePlace = async (id: number) => {
  await deviceStore.deletePlace(id);
};
</script>
