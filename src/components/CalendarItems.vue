<template>
  <ul class="max-w-md divide-y divide-gray-200 dark:divide-gray-700">
    <li
      class="pb-3 sm:pb-4 py-2"
      v-for="(element, index) in calendarElements"
      :key="index"
    >
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0">
          <button
            @click="archive(element)"
            type="button"
            class="text-red-700 border border-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center mr-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800 dark:hover:bg-red-500"
          >
            <svg
              class="w-6 h-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 15"
            >
              <path
                d="M1 13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6H1v7Zm5.293-3.707a1 1 0 0 1 1.414 0L8 9.586V8a1 1 0 0 1 2 0v1.586l.293-.293a1 1 0 0 1 1.414 1.414l-2 2a1 1 0 0 1-1.416 0l-2-2a1 1 0 0 1 .002-1.414ZM17 0H1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1Z"
              />
            </svg>
          </button>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ element.note }}
          </p>
        </div>
        <div
          class="absolute inline-flex items-center justify-center text-xs font-bold rounded-full -bottom-2 -right-2 text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300 px-2 py-1"
        >
          Pn. 12.03 13:30 (3d)
        </div>
      </div>
    </li>
  </ul>
  <div
    class="p-5 mb-4 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
  >
    <time class="text-lg font-semibold text-gray-900 dark:text-white"
      >January 13th, 2022</time
    >
    <ol class="mt-3 divide-y divider-gray-200 dark:divide-gray-700">
      <li>
        <div class="text-gray-600 dark:text-gray-400">
          <div class="text-base font-normal">
            <span class="font-medium text-gray-900 dark:text-white"
              >Jese Leos</span
            >
            likes
            <span class="font-medium text-gray-900 dark:text-white"
              >Bonnie Green's</span
            >
            post in
            <span class="font-medium text-gray-900 dark:text-white">
              How to start with Flowbite library</span
            >
          </div>
          <div class="text-sm font-normal">
            "I wanted to share a webinar zeroheight."
          </div>
          <span
            class="inline-flex items-center text-xs font-normal text-gray-500 dark:text-gray-400"
          >
            <svg
              class="w-2.5 h-2.5 mr-1"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 .5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19ZM8.374 17.4a7.6 7.6 0 0 1-5.9-7.4c0-.83.137-1.655.406-2.441l.239.019a3.887 3.887 0 0 1 2.082 2.5 4.1 4.1 0 0 0 2.441 2.8c1.148.522 1.389 2.007.732 4.522Zm3.6-8.829a.997.997 0 0 0-.027-.225 5.456 5.456 0 0 0-2.811-3.662c-.832-.527-1.347-.854-1.486-1.89a7.584 7.584 0 0 1 8.364 2.47c-1.387.208-2.14 2.237-2.14 3.307a1.187 1.187 0 0 1-1.9 0Zm1.626 8.053-.671-2.013a1.9 1.9 0 0 1 1.771-1.757l2.032.619a7.553 7.553 0 0 1-3.132 3.151Z"
              />
            </svg>
            Public
          </span>
        </div>
      </li>
      <li>
        <div>
          <div class="text-base font-normal text-gray-600 dark:text-gray-400">
            <span class="font-medium text-gray-900 dark:text-white"
              >Bonnie Green</span
            >
            react to
            <span class="font-medium text-gray-900 dark:text-white"
              >Thomas Lean's</span
            >
            comment
          </div>
          <span
            class="inline-flex items-center text-xs font-normal text-gray-500 dark:text-gray-400"
          >
            <svg
              class="w-2.5 h-2.5 mr-1"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="m2 13.587 3.055-3.055A4.913 4.913 0 0 1 5 10a5.006 5.006 0 0 1 5-5c.178.008.356.026.532.054l1.744-1.744A8.973 8.973 0 0 0 10 3C4.612 3 0 8.336 0 10a6.49 6.49 0 0 0 2 3.587Z"
              />
              <path
                d="m12.7 8.714 6.007-6.007a1 1 0 1 0-1.414-1.414L11.286 7.3a2.98 2.98 0 0 0-.588-.21l-.035-.01a2.981 2.981 0 0 0-3.584 3.583c0 .012.008.022.01.033.05.204.12.401.211.59l-6.007 6.007a1 1 0 1 0 1.414 1.414L8.714 12.7c.189.091.386.162.59.211.011 0 .021.007.033.01a2.981 2.981 0 0 0 3.584-3.584c0-.012-.008-.023-.011-.035a3.05 3.05 0 0 0-.21-.588Z"
              />
              <path
                d="M17.821 6.593 14.964 9.45a4.952 4.952 0 0 1-5.514 5.514L7.665 16.75c.767.165 1.55.25 2.335.251 6.453 0 10-5.258 10-7 0-1.166-1.637-2.874-2.179-3.407Z"
              />
            </svg>
            Private
          </span>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  calendarElements: {
    type: Array,
    required: true,
  },
});
</script>
