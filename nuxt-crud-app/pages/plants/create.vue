<template>
  <v-container>
    <h1>Create Plant</h1>
    <v-form @submit.prevent="createPlant">
      <TextFieldWithLabel
          v-model="name"
          title="Name"
          label="Name"
          required
      ></TextFieldWithLabel>
      <v-text-field v-model="species" label="Species"></v-text-field>
      <v-text-field v-model="location" label="Location"></v-text-field>
      <v-text-field v-model.number="targetHumidityMin" label="Target Humidity Min" type="number"></v-text-field>
      <v-text-field v-model.number="targetHumidityMax" label="Target Humidity Max" type="number"></v-text-field>
      <v-text-field v-model.number="targetWateringDurationSec" label="Target Watering Duration (sec)" type="number"></v-text-field>
      <v-checkbox v-model="active" label="Active"></v-checkbox>
      <v-btn type="submit" color="primary">Create</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import { VContainer, VForm, VTextField, VBtn, VCheckbox } from 'vuetify/components';

const name = ref('');
const species = ref('');
const location = ref('');
const targetHumidityMin = ref<number | null>(null);
const targetHumidityMax = ref<number | null>(null);
const targetWateringDurationSec = ref<number | null>(null);
const active = ref(true);

const router = useRouter();
const deviceStore = useDeviceStore();

const createPlant = async () => {
  await deviceStore.createPlant({
    name: name.value,
    species: species.value,
    location: location.value,
    targetHumidityMin: targetHumidityMin.value,
    targetHumidityMax: targetHumidityMax.value,
    targetWateringDurationSec: targetWateringDurationSec.value,
    active: active.value,
  });
  router.push('/plants');
};
</script>
