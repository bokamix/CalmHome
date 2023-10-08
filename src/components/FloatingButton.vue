<template>
  <div
    class="fixed right-6 bottom-28 group"
    style="z-index: 999"
  >
    <div
      id="speed-dial-menu-click"
      class="flex flex-col items-center mb-4 space-y-2"
      v-if="showActions"
    >
      <button
        v-for="item in menuItems"
        :key="item.id"
        type="button"
        @click="clickButton(item.label)"
        class="relative w-[52px] h-[52px] text-gray-500 bg-white rounded-full border border-gray-200 hover:text-gray-900 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
      >
        <component v-if="item.icon" :is="item.icon" />
        <span
          class="absolute block mb-px text-sm font-medium -translate-y-1/2 right-16 top-1/2"
          >{{ item.label }}</span
        >
      </button>
    </div>
    <button
      type="button"
      @click="showActions = !showActions"
      class="flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
    >
      <svg
        class="w-5 h-5 transition-transform group-hover:rotate-45"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 18 18"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 1v16M1 9h16"
        />
      </svg>
      <span class="sr-only">Open actions menu</span>
    </button>
  </div>
</template>

<script setup>
import icon from "./icons/IconCommunity.vue";

import { defineEmits, ref } from "vue";

const showActions = ref(false);
const emit = defineEmits(["clickElement"]);
const menuItems = [
  {
    id: "share",
    icon: icon,
    label: "Share",
    tooltip: "Share",
  },
  {
    id: "print",
    icon: "print",
    label: "Print",
    tooltip: "Print",
  },
  {
    id: "download",
    icon: "download",
    label: "Download",
    tooltip: "Download",
  },
  {
    id: "copy",
    icon: "copy",
    label: "Copy",
    tooltip: "Copy",
  },
];
const clickButton = (element) => {
  emit("clickElement", element);
  showActions.value = false;
};
</script>

<style></style>
