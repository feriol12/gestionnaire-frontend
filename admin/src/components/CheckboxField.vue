<script setup>
// Case à cocher native 18px stylée par accent-color (focus et clavier natifs).
import { useId } from 'vue'

const model = defineModel({ type: Boolean, default: false })

defineProps({
  label: { type: String, required: true },
})

const id = useId()
</script>

<template>
  <div class="checkbox-field">
    <input :id="id" v-model="model" type="checkbox" class="checkbox-field__input" />
    <label :for="id" class="checkbox-field__label">{{ label }}</label>
  </div>
</template>

<style scoped>
.checkbox-field {
  display: inline-flex;
  align-items: center;
  gap: var(--fm-space-sm);
  min-height: var(--fm-control-height);
}

.checkbox-field__input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--fm-primary);
  cursor: pointer;
}

.checkbox-field__label {
  color: var(--fm-heading);
  cursor: pointer;
}
</style>
