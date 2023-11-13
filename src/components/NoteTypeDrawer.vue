<template>
  <div
    v-if="show"
    id="drawer-bottom-example"
    class="fixed bottom-0 left-0 right-0 drawer-note w-full p-4 overflow-y-auto transition-transform bg-white dark:bg-gray-800 transform-none flex flex-col justify-center"
  >
    <button
      @click="selectType(option)"
      v-for="option in allOptions"
      :key="option.name"
      type="button"
      class="text-blue-700 hover:text-white border border-blue-700 font-medium rounded-lg text-sm px-10 py-10 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white"
      :class="{ 'dark:bg-blue-700 dark:text-white': selectedType.name === option.name }"
    >
      {{  option.name }}
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from "vue";

const props = defineProps({
  show: Boolean,
  options: Array,
});

// emit
const selectedType = ref(props.options[0]);
const customEvents = ref([
  { name: "webhook", type: 'event' },
  { name: "date", type: 'event' },
  { name: "clipboard", type: 'event' },
]);
const allOptions = computed(() => [...customEvents.value, ...props.options]);
const emits = defineEmits(["onClose, onSelectType"]);
const emitClose = () => {
  emits("onClose");
};
const selectType = (type) => {
  console.log('asdsad', type);
  selectedType.value = type;

  emits("onSelectType", type);
};
</script>

<style lang="scss" scoped>
.drawer-note {
  z-index: 9999;
}
</style>
