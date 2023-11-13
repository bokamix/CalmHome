<template>
  <div
    v-if="copyModal"
    id="drawer-bottom-example"
    class="fixed top-0 left-0 right-0 drawer-999 w-full p-4 overflow-y-auto transition-transform bg-white dark:bg-gray-800 transform-none flex flex-col justify-center"
  >
    <button
      @click="copyNote(option)"
      type="button"
      class="text-blue-700 hover:text-white border border-blue-700 font-medium rounded-lg text-sm px-10 py-10 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white"
    >
      copy
    </button>
  </div>
  <div v-if="tabs[selectedTab].name === 'calendar'">
    <calendar-items :calendarElements="calendarElements" />
  </div>
  <div v-if="tasksElements.length">
    <!-- list of tasks -->
    <ul class="max-w-md divide-y divide-gray-200 dark:divide-gray-700">
      <li
        class="pb-3 sm:pb-4 py-2"
        v-for="(element, index) in tasksElements"
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
        </div>
      </li>
    </ul>
  </div>
  <div
    class="mt-10"
    v-if="tabs[selectedTab].archive && tabs[selectedTab].archive.length"
  >
    <ul class="max-w-md divide-y divide-gray-200 dark:divide-gray-700">
      <li
        class="pb-3 sm:pb-4"
        v-for="(element, index) in tabs[selectedTab].archive"
        :key="index"
      >
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <button
              @click="unarchive(element)"
              type="button"
              class="text-green-700 border border-green-700 hover:bg-green-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center mr-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:focus:ring-green-800 dark:hover:bg-green-500"
            >
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
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
                  d="M7 11h4m-2 2V9M2 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm5.443-4H2a1 1 0 0 0-1 1v3h9.943l-2.7-3.6a1 1 0 0 0-.8-.4Z"
                />
              </svg>
            </button>
          </div>
          <div class="flex-1 min-w-0">
            <p class="line-through dark:text-gray-400 text-sm font-medium">
              {{ element }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </div>
  <!-- recording drawers -->
  <div
    id="drawer-top-example"
    class="fixed flex justify-center top-0 left-0 right-0 z-40 w-full h-1/4 p-4 overflow-y-auto transition-transform bg-red dark:bg-red-800 transform-none"
    v-if="recording"
    style="z-index: 999"
    @click="stopRecordingWithoutSave"
    tabindex="-1"
  >
    STOP!
  </div>
  <div
    id="drawer-bottom-example"
    class="fixed flex justify-center bottom-0 left-0 right-0 z-40 w-full h-2/4 p-4 overflow-y-auto transition-transform bg-white dark:bg-gray-800 transform-none"
    v-if="recording"
    style="z-index: 999"
    tabindex="-1"
  >
    <AVMedia
      :canv-height="200"
      :canv-width="200"
      @click="stopRecord"
      :media="stream"
      type="circle"
      line-color="blue"
    />
  </div>
  <!-- end recording drawers -->
  <FloatingButton
    :loading="sending"
    v-if="!recording"
    @clickElement="clickButtonInMenu"
  />
  <div class="loading-spinner" v-if="sending">
    <div class="spinner"></div>
  </div>
  <div class="pending-requests" v-if="pendingRequests.length">
    <h3>Wysyłane żądania:</h3>
    <ul>
      <li v-for="request in pendingRequests" :key="request">
        {{ request }}
      </li>
    </ul>
  </div>
  <NoteTypeDrawer
    :show="showTypeModal"
    @onClose="showTypeModal = false"
    @onSelectType="selectType"
    :options="tabs"
  />

  <div class="container">
    <div
      class="my-12"
      v-if="
        !(
          tabs[selectedTab].name === 'calendar' ||
          tabs[selectedTab].name === 'tasks'
        )
      "
    >
      <textarea
        v-model="tabs[selectedTab].note"
        id="message"
        rows="18"
        class="texarea-wrapper border-transparent"
        placeholder="Response"
        user-scalable="no"
      ></textarea>
    </div>
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <span @click="toggleModal" class="close">&times;</span>
        <div class="recordings-list">
          <h3>Recordings:</h3>
          <span @click="toggleModal">Zamknij</span>
          <ul>
            <li v-for="recording in recordings" :key="recording.name">
              {{ recording.name }}
              <audio controls playsinline>
                <source :src="recording.url" type="audio/mp3" />
              </audio>
              <button
                @click="sendToWhisper(recording)"
                type="button"
                class="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
              >
                Wyślij
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <!-- menu \ -->
  <div
    class="fixed bottom-0 z-50 w-full -translate-x-1/2 bg-white border-t border-gray-200 left-1/2 dark:bg-gray-700 dark:border-gray-600"
  >
    <div class="w-full">
      <div
        class="grid max-w-xs grid-cols-3 gap-1 p-1 mx-auto my-2 bg-gray-100 rounded-lg dark:bg-gray-600"
        role="group"
      >
        <button
          v-for="(tab, index) in tabs"
          type="button"
          class="px-5 py-1.5 text-xs font-medium text-gray-900 rounded-lg text-white"
          @click="selectTab(index)"
          :class="selectedTab === index ? 'bg-gray-200 dark:bg-gray-700' : ''"
          :key="tab.name"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>
    <div class="grid h-full max-w-lg grid-cols-5 mx-auto">
      <button
        type="button"
        @click="clearNote"
        class="inline-flex flex-col items-center justify-center px-5 group"
      >
        <svg
          class="w-[19px] h-[19px] text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
        <span class="sr-only">Records</span>
      </button>
      <button
        type="button"
        @click="toggleModal"
        class="inline-flex flex-col items-center justify-center px-5 group"
      >
        <svg
          class="w-[21px] h-[21px] text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 18 16"
        >
          <path
            d="M14.316.051A1 1 0 0 0 13 1v8.473A4.49 4.49 0 0 0 11 9c-2.206 0-4 1.525-4 3.4s1.794 3.4 4 3.4 4-1.526 4-3.4a2.945 2.945 0 0 0-.067-.566c.041-.107.064-.22.067-.334V2.763A2.974 2.974 0 0 1 16 5a1 1 0 0 0 2 0C18 1.322 14.467.1 14.316.051ZM10 3H1a1 1 0 0 1 0-2h9a1 1 0 1 1 0 2Z"
          />
          <path
            d="M10 7H1a1 1 0 0 1 0-2h9a1 1 0 1 1 0 2Zm-5 4H1a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2Z"
          />
        </svg>
        <span class="sr-only">Wallet</span>
      </button>
      <div
        id="tooltip-bookmark"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        Bookmark
        <div class="tooltip-arrow" data-popper-arrow></div>
      </div>
      <button
        type="button"
        @click="() => (recording ? stopRecord() : startRecord())"
        class="rounded-full inline-flex flex-col items-center justify-center p-4 group"
        :class="recording ? 'bg-red-600' : 'bg-blue-600'"
      >
        <svg
          v-if="!recording"
          class="w-[15px] h-[15px] text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 14 16"
        >
          <path
            d="M0 .984v14.032a1 1 0 0 0 1.506.845l12.006-7.016a.974.974 0 0 0 0-1.69L1.506.139A1 1 0 0 0 0 .984Z"
          />
        </svg>
        <svg
          v-if="recording"
          class="w-[15px] h-[15px] text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 12 16"
        >
          <path
            d="M3 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm7 0H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z"
          />
        </svg>
      </button>
      <div
        id="tooltip-post"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        New post
        <div class="tooltip-arrow" data-popper-arrow></div>
      </div>
      <button
        type="button"
        @click="undo"
        class="inline-flex flex-col items-center justify-center px-5 group"
      >
        <svg
          class="w-[21px] h-[21px] text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 16 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="m12 7 3-3-3-3m0 12H5.5a4.5 4.5 0 1 1 0-9H14"
          />
        </svg>
      </button>
      <button
        type="button"
        @click="copy"
        class="inline-flex flex-col items-center justify-center px-5 group"
      >
        <svg
          class="w-[21px] h-[21px] text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 16 20"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M2 5a1 1 0 0 0-1 1v12a.969.969 0 0 0 .933 1h8.1a1 1 0 0 0 1-1.033M10 1v4a1 1 0 0 1-1 1H5m10-4v12a.97.97 0 0 1-.933 1H5.933A.97.97 0 0 1 5 14V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 9.828 1h4.239A.97.97 0 0 1 15 2Z"
          />
        </svg>
        <span class="sr-only">copy</span>
      </button>
      <div
        id="tooltip-settings"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        Settings
        <div class="tooltip-arrow" data-popper-arrow></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";

// import AVMedia from '@/components/AVMedia.vue'
import { AVMedia } from "vue-audio-visual";
import FloatingButton from "@/components/FloatingButton.vue";
import CalendarItems from "@/components/CalendarItems.vue";
import NoteTypeDrawer from "@/components/NoteTypeDrawer.vue";

const recording = ref(false);
const url = ref(null);
const mediaRecorder = ref(null);
const audioChunks = ref([]);
const response = ref("");
const sending = ref(false);
const lastNote = ref("");
const audioLevels = ref(Array(10).fill(0));
const recordings = ref([]);
const showModal = ref(false);
const indexAudio = ref(0);
const pendingRequests = ref([]);
const tabs = ref([
  { name: "main", note: "" },
  { name: "tasks", note: "", archive: [] },
  { name: "calendar", note: "" },
]);
const selectedTab = ref(0);
const selectTab = (tab) => {
  selectedTab.value = tab;
};

watch(
  () => tabs,
  (newValue) => {
    newValue.value.forEach((tab) => {
      localStorage.setItem("savedNote" + tab.name, tab.note);
      if (tab.archive) {
        //tab archive is array
        const archiveToJson = JSON.stringify(tab.archive);
        localStorage.setItem("savedArchive" + tab.name, archiveToJson);
      }
    });
  },
  { deep: true }
);
const calendarElements = computed(() => {
  if (tabs.value[selectedTab.value].name === "calendar") {
    return tabs.value[selectedTab.value].note
      .split("\n")
      .map((note) => ({
        note,
      }))
      .filter((element) => element.note);
  }
  return [];
});

const tasksElements = computed(() => {
  if (tabs.value[selectedTab.value].name === "tasks") {
    return tabs.value[selectedTab.value].note
      .split("\n")
      .map((note) => ({
        note,
      }))
      .filter((element) => element.note);
  }
  return [];
});
const archive = (element) => {
  const index = tabs.value[selectedTab.value].note.indexOf(element.note);
  if (index > -1) {
    tabs.value[selectedTab.value].archive.push(element.note);
    tabs.value[selectedTab.value].note = tabs.value[
      selectedTab.value
    ].note.replace(element.note, "");
  }
};
const unarchive = (element) => {
  const index = tabs.value[selectedTab.value].archive.indexOf(element);
  if (index > -1) {
    tabs.value[selectedTab.value].note += `\n${element}`;
    tabs.value[selectedTab.value].archive.splice(index, 1);
  }
};

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("record") === "true") {
    startRecord();
  }
  tabs.value.forEach((tab) => {
    const savedNote = localStorage.getItem("savedNote" + tab.name);
    if (tab.archive) {
      const savedArchive = localStorage.getItem("savedArchive" + tab.name);
      console.log(savedArchive);
      if (savedArchive) {
        tab.archive = JSON.parse(savedArchive);
        console.log(tab.archive);
      }
    }
    if (savedNote) {
      tab.note = savedNote;
    }
  });
  await initDB();
  const request = indexedDB.open("recordingsDB");
  request.onsuccess = (event) => {
    const db = event.target.result;

    const tx = db.transaction("recordings", "readonly");
    const store = tx.objectStore("recordings");

    (store.openCursor(null, "prev").onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor && recordings.value.length < 5) {
        const recording = cursor.value;
        recording.url = URL.createObjectURL(recording.blob);
        recordings.value.push(recording);
        cursor.continue();
      }
    }),
      (tx.oncomplete = () => db.close());
  };
});
const stream = ref(null);
const startRecord = async () => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((workingStream) => {
    stream.value = workingStream;
    recording.value = true;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(workingStream);
    source.connect(analyser);
    analyser.fftSize = 32;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioLevels = () => {
      if (!recording.value) return;

      analyser.getByteFrequencyData(dataArray);
      for (let i = 0; i < audioLevels.value.length; i++) {
        audioLevels.value[i] = (dataArray[i] / 255) * 100;
      }

      requestAnimationFrame(updateAudioLevels);
    };

    updateAudioLevels();

    mediaRecorder.value = new MediaRecorder(workingStream);
    mediaRecorder.value.start(1000);
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data);
    };
    audioChunks.value = [];
    url.value = null;
  });
};

const stopRecord = () => {
  recording.value = false;
  mediaRecorder.value.stop();
  mediaRecorder.value.stream.getTracks().forEach((track) => track.stop());

  mediaRecorder.value.addEventListener("stop", async () => {
    const audioBlob = new Blob(audioChunks.value, { type: "audio/mp3" });

    const currentRecord = {
      blob: audioBlob,
      name: `voice_${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(audioBlob),
    };
    recordings.value.unshift(currentRecord);
    sendToWhisper(currentRecord);
    recordings.value = recordings.value.slice(0, 5);
    const recording = { blob: audioBlob, name: `voice_${indexAudio.value}` };

    const request = indexedDB.open("recordingsDB");
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction("recordings", "readwrite");
      const store = tx.objectStore("recordings");
      store.put(recording);

      store.openCursor(null, "next").onsuccess = function (event) {
        let cursor = event.target.result;
        let count = 0;

        while (cursor && ++count > 5) {
          const toDeleteKey = cursor.primaryKey;
          cursor.continue().onsuccess = function () {
            store.delete(toDeleteKey);
          };
        }
      };

      tx.oncomplete = () => db.close();
    };
  });
};

const initDB = async () => {
  const request = await indexedDB.open("recordingsDB", 2);
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("recordings")) {
      db.createObjectStore("recordings", { autoIncrement: true });
    }
  };

  request.onerror = (event) => {
    console.error("Error opening IndexedDB:", event.target.error);
  };
};

const sendToWebhook = async () => {
  if (!tabs.value[selectedTab.value].note || sending.value) return;
  sending.value = true;

  try {
    const webhookAddress =
      "https://hook.eu1.make.com/fsiqaia58kx69dlucon8eg8smu1pf10x";
    const data = { text: tabs.value[selectedTab.value].note };
    const response = await fetch(webhookAddress, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    tabs.value[selectedTab.value].note = "";
  } catch (error) {
    alert(error);
    console.error("An error occurred:", error);
  } finally {
    sending.value = false;
  }
};
const clickButtonInMenu = async (name) => {
  if (name === "webhook") {
    sendToWebhook();
  }
  if (name === "date") {
    // https://hook.eu1.make.com/phz63weziqykuunqda3hglp19c7fnu5i
    sending.value = true;
    // add try catch

    // const data = { text: tabs.value[selectedTab.value].note };
    // fetch("https://hook.eu1.make.com/phz63weziqykuunqda3hglp19c7fnu5i", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(data),
    // });
    try {
      const webhookAddress =
        "https://hook.eu1.make.com/phz63weziqykuunqda3hglp19c7fnu5i";
      const data = { text: tabs.value[selectedTab.value].note };
      await fetch(webhookAddress, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      tabs.value[selectedTab.value].note = "";
    } catch (error) {
      alert(error);
      console.error("An error occurred:", error);
    } finally {
      sending.value = false;
    }
  }
};
const copyModal = ref(false);
const copyNote = () => {
  navigator.clipboard.writeText(lastNote.value);
  copyModal.value = false;
};
const showTypeModal = ref(false);
const selectedType = ref("");
const showModalToChooseType = () => {
  showTypeModal.value = true;
};
const selectType = (type) => {
  selectedType.value = type;
  if (selectedType.value.type === "event") return;
  const tabIndex = tabs.value.findIndex((tab) => tab.name === type.name);
  selectTab(tabIndex);
};

// dodać pokazanie modala po rozpoznaniu notatki, obsłyga czasu i czyszczenia zaznaczonej kategorii
// ogarnięcie logiki, zaznaczonej kategorii.

const sendToNotion = async (note) => {
  if (!note?.length) return;
  sending.value = true;

  try {
    const webhookAddress =
      "https://hook.eu1.make.com/fsiqaia58kx69dlucon8eg8smu1pf10x";
    const data = { text: note };
    const response = await fetch(webhookAddress, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
  } catch (error) {
    alert(error);
    console.error("An error occurred:", error);
  } finally {
    sending.value = false;
  }
};

const eventsActions = async (name, note) => {
  if (name === "webhook") {
    sendToNotion(note);
  }
  if (name === "date") {
    sending.value = true;
    try {
      const webhookAddress =
        "https://hook.eu1.make.com/phz63weziqykuunqda3hglp19c7fnu5i";
      const data = { text: note };
      await fetch(webhookAddress, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (error) {
      alert(error);
      console.error("An error occurred:", error);
    } finally {
      sending.value = false;
    }
  }
  if (name === "clipboard") {
    copyModal.value = true;
  }
};
const sendToWhisper = async (recording) => {
  if (!recording.blob) return;
  pendingRequests.value.push(recording.name);

  var formData = new FormData();
  formData.append("file", recording.blob, `voice_${indexAudio.value}.mp3`);
  fetch("https://hook.eu1.make.com/c0hlgwfm9sfzaw4erljmmv3as63326mb", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then(async (data) => {
      showModalToChooseType();
      await new Promise((resolve) => setTimeout(resolve, 5000));
      showTypeModal.value = false;
      const index = pendingRequests.value.indexOf(recording.name);
      const addToBoard = () => {
        tabs.value[selectedTab.value].note += `\n${data}`;
        localStorage.setItem(
          "savedNote" + tabs.value[selectedTab.value].name,
          tabs.value[selectedTab.value].note
        );
      };
      if (index > -1) {
        pendingRequests.value.splice(index, 1);
      }
      if (selectedType.value.type === "event") {
        eventsActions(selectedType.value.name, data);
      } else {
        addToBoard();
      }
      lastNote.value = data;
      navigator.clipboard.writeText(lastNote.value);
      response.value = data.includes("Amara") ? "" : data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const undo = () => {
  tabs.value[selectedTab.value].note = tabs.value[
    selectedTab.value
  ].note.replace(lastNote.value, "");
};

const copy = () => {
  navigator.clipboard.writeText(tabs.value[selectedTab.value].note);
};

const toggleModal = () => {
  showModal.value = !showModal.value;
};

const clearNote = () => {
  if (tabs.value[selectedTab.value].archive) {
    tabs.value[selectedTab.value].archive = [];
    return;
  }
  tabs.value[selectedTab.value].note = "";
  localStorage.removeItem("savedNote" + tabs.value[selectedTab.value].name);
};
const stopRecordingWithoutSave = () => {
  if (!recording.value) return;
  recording.value = false;
  mediaRecorder.value.stop();
  mediaRecorder.value.stream.getTracks().forEach((track) => track.stop());
};
</script>

<style scoped lang="scss">
.open-modal-button {
  background-color: #ff7f00;
  border: none;
  color: white;
  padding: 16px 32px;
  text-align: center;
  font-size: 16px;
  margin: 10px 2px;
  cursor: pointer;
  &:hover {
    background-color: #e76f00;
  }
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #fefefe;
  border-radius: 5px;
  padding: 20px;
  width: 100vw;
  height: 100vh;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.close {
  position: absolute;
  right: 10px;
  top: 5px;
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    color: black;
  }
}
.pending-requests {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000; /* aby upewnić się, że zawsze jest na wierzchu */
  padding: 10px;
  width: 250px; /* możesz dostosować szerokość według potrzeb */
  max-height: 300px; /* możesz dostosować wysokość według potrzeb */
  overflow-y: auto; /* umożliwia przewijanie w razie potrzeby */
  background-color: rgba(0, 0, 0, 0.6); /* przezroczyste czarne tło */
  color: white; /* biały kolor tekstu */
  border-radius: 5px; /* zaokrąglone rogi */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* lekki cień dla wyróżnienia */
}

.pending-requests h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

.pending-requests ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.pending-requests li {
  padding: 5px 0;
}
.texarea-wrapper {
  color: white;
  background: sandybrown;
  padding: 5px;
  max-height: 200px;
  resize: none;
  width: 90%;
  outline: none;
  border: none;
  overflow: auto;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
}
.texarea-wrapper:focus {
  border: none !important;
}
.drawer-999 {
  z-index: 999;
}
</style>
