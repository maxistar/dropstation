<template>
  <v-container>
    <h1>Edit Device</h1>
    <v-form ref="formRef" @submit.prevent="submitDeviceUpdate">
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
          v-model.number="placeId"
          type="number"
          label="Place ID"
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
      <v-btn type="button" color="primary" @click="submitDeviceUpdate">Update</v-btn>
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
const placeId = ref(1);
const sleepDuration = ref(0);
const activityNumber = ref(0);
const checkInterval = ref(0);
const router = useRouter();
const route = useRoute();
const id = route.params.id;
const deviceStore = useDeviceStore();
const formRef = ref<InstanceType<typeof VForm> | null>(null);

const fetchDevice = async () => {
  const device = await deviceStore.fetchDevice(Number(id));
  name.value = device.name;
  notes.value = device.notes;
  deviceKey.value = device.deviceKey;
  placeId.value = device.placeId ?? 1;
  sleepDuration.value = device.sleepDuration;
  activityNumber.value = device.activityNumber;
  checkInterval.value = device.checkInterval;
};

const updateDevice = async () => {
  const normalizedName = name.value.trim();
  const normalizedNotes = notes.value.trim() || normalizedName;
  const normalizedPayload = {
    placeId: Math.trunc(Number(placeId.value)),
    name: normalizedName,
    notes: normalizedNotes,
    deviceKey: deviceKey.value.trim(),
    sleepDuration: Math.trunc(Number(sleepDuration.value)),
    activityNumber: Math.trunc(Number(activityNumber.value)),
    checkInterval: Math.trunc(Number(checkInterval.value)),
  };
  await deviceStore.updateDevice(Number(id), {
    ...normalizedPayload,
  });
  router.push('/devices');
};

const submitDeviceUpdate = async () => {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) {
    return;
  }

  await updateDevice();
};

onMounted(fetchDevice);
</script>
