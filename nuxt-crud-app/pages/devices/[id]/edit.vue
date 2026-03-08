<template>
  <v-container>
    <h1>Edit Device</h1>
    <v-form @submit.prevent="updateDevice">
      <TextFieldWithLabel
          v-model="name"
          title="Name"
          label="Name"
          required
      ></TextFieldWithLabel>
      <v-text-field
          v-model="notes"
          label="Notes"
      ></v-text-field>
      <v-text-field
          v-model="deviceKey"
          label="Device Key"
          required
      ></v-text-field>
      <v-text-field
          v-model.number="sleepDuration"
          type="number"
          label="Sleep Duration (sec)"
          required
      ></v-text-field>
      <v-text-field
          v-model.number="activityNumber"
          type="number"
          label="Activity Number"
          required
      ></v-text-field>
      <v-text-field
          v-model.number="checkInterval"
          type="number"
          label="Check Interval (sec)"
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

const name = ref('');
const notes = ref('');
const deviceKey = ref('');
const sleepDuration = ref(0);
const activityNumber = ref(0);
const checkInterval = ref(0);
const router = useRouter();
const route = useRoute();
const id = route.params.id;
const deviceStore = useDeviceStore();

const fetchDevice = async () => {
  const device = await deviceStore.fetchDevice(Number(id));
  name.value = device.name;
  notes.value = device.notes;
  deviceKey.value = device.deviceKey;
  sleepDuration.value = device.sleepDuration;
  activityNumber.value = device.activityNumber;
  checkInterval.value = device.checkInterval;
};

const updateDevice = async () => {
  await deviceStore.updateDevice(Number(id), {
    name: name.value,
    notes: notes.value,
    deviceKey: deviceKey.value,
    sleepDuration: sleepDuration.value,
    activityNumber: activityNumber.value,
    checkInterval: checkInterval.value,
  });
  router.push('/devices');
};

onMounted(fetchDevice);
</script>
