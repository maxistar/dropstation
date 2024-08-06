<template>
  <div>
    <div class="text-field-title">
      {{ title }}
    </div>
    <v-text-field
        v-model="model"
        :label="title"
        :required="required"
    ></v-text-field>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  modelValue: string,
  title: string,
  required: Boolean,
}>();

const model = defineModel()

</script>

<style scoped>
.text-field-title {
  margin-bottom: 8px;
  font-weight: bold;
}
</style>
