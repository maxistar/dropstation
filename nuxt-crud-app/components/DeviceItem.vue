<template>
  <v-card class="device-item">
    <v-card-text class="device-info">
      {{ device.name }}
    </v-card-text>
    <v-card-actions class="device-actions">
      <v-btn @click="$emit('edit', device.id)" color="primary"><v-icon icon="mdi-pencil" /> Edit</v-btn>
      <v-btn @click="showConfirmDialog" color="error"><v-icon icon="mdi-delete" /> Delete</v-btn>
    </v-card-actions>

    <ConfirmationDialog
        :isOpen="dialog"
        title="Confirm Deletion"
        message="Are you sure you want to delete this device?"
        @update:isOpen="dialog = $event"
        @confirm="confirmDelete"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';
import ConfirmationDialog from '~/components/ConfirmationDialog.vue';

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
