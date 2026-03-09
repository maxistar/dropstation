<template>
  <v-container>
    <h1>Create Capacitor</h1>
    <v-form @submit.prevent="createCapacitor">
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
      <v-btn type="submit" color="primary">Create</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import { VContainer, VForm, VTextField, VBtn } from 'vuetify/components';

const capacity = ref<number>(0);
const value = ref<number>(0);
const router = useRouter();
const deviceStore = useDeviceStore();

const createCapacitor = async () => {
  await deviceStore.createCapacitor(capacity.value, value.value);
  router.push('/capacitors');
};
</script>
