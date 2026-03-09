<template>
  <v-container>
    <h1>Edit Place</h1>
    <v-form @submit.prevent="updatePlace">
      <div class="text-field-title">
        Index
      </div>
      <v-text-field
          v-model.number="index"
          label="Index"
          type="number"
          required
      ></v-text-field>
      <TextFieldWithLabel
          v-model="name"
          title="Name"
          label="Name"
          required
      ></TextFieldWithLabel>
      <v-btn type="submit" color="primary">Update</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import { VContainer, VForm, VTextField, VBtn } from 'vuetify/components';

const index = ref<number>(1);
const name = ref('');
const router = useRouter();
const route = useRoute();
const id = Number(route.params.id);
const deviceStore = useDeviceStore();

const fetchPlace = async () => {
  const place = await deviceStore.fetchPlace(id);
  index.value = place.index;
  name.value = place.name;
};

const updatePlace = async () => {
  await deviceStore.updatePlace(id, index.value, name.value);
  router.push('/places');
};

onMounted(fetchPlace);
</script>
