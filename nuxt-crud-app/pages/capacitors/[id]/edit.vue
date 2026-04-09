<template>
  <v-container>
    <h1>Edit Capacitor</h1>
    <v-form @submit.prevent="updateCapacitor">
      <div class="text-field-title">
        Capacity
      </div>
      <v-text-field
          v-model.number="capacity"
          label="Capacity"
          type="number"
          required
      ></v-text-field>
      <div class="text-field-title">
        Value
      </div>
      <v-text-field
          v-model.number="value"
          label="Value"
          type="number"
          required
      ></v-text-field>
      <v-btn type="submit" color="primary">Update</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import { VContainer, VForm, VTextField, VBtn } from 'vuetify/components';

const capacity = ref<number>(0);
const value = ref<number>(0);
const router = useRouter();
const route = useRoute();
const id = Number(route.params.id);
const deviceStore = useDeviceStore();

const fetchCapacitor = async () => {
  const capacitor = await deviceStore.fetchCapacitor(id);
  capacity.value = capacitor.capacity;
  value.value = capacitor.value;
};

const updateCapacitor = async () => {
  await deviceStore.updateCapacitor(id, capacity.value, value.value);
  router.push('/capacitors');
};

onMounted(fetchCapacitor);
</script>
