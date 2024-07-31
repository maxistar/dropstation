<template>
  <v-card class="device-item">
    <v-card-text class="device-info">
      {{ device.name }}
    </v-card-text>
    <v-card-actions class="device-actions">
      <v-btn @click="$emit('edit', device.id)" color="primary">Edit</v-btn>
      <v-btn @click="showConfirmDialog" color="error">Delete</v-btn>
    </v-card-actions>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete this device?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">Cancel</v-btn>
          <v-btn color="error" text @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { VCard, VCardText, VCardActions, VBtn, VSpacer } from 'vuetify/components';

const props = defineProps({
  device: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['edit', 'delete']);

const dialog = ref(false);

const showConfirmDialog = () => {
  dialog.value = true;
};

const confirmDelete = () => {
  emit('delete', props.device.id);
  dialog.value = false;
};
</script>

<style scoped>
.device-item {
  margin-bottom: 1rem;
}

.device-info {
  flex-grow: 1;
}

.device-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
