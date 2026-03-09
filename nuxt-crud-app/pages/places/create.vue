<template>
  <v-container>
    <h1>Create Place</h1>
    <v-form @submit.prevent="createPlace">
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
      <v-btn type="submit" color="primary">Create</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import { VContainer, VForm, VTextField, VBtn } from 'vuetify/components';

const index = ref<number>(1);
const name = ref('');
const router = useRouter();
const deviceStore = useDeviceStore();

const createPlace = async () => {
  await deviceStore.createPlace(index.value, name.value);
  router.push('/places');
};
</script>
