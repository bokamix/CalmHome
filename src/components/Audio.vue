<template>
  <!-- Loading animation container -->
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

  <div class="container">
    <button
      role="button"
      @click="sendToWebhook"
      type="button"
      class="text-white px-28 w-full bg-gradient-to-br from-green-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
    >
      <div v-if="sending">
        <svg
          aria-hidden="true"
          role="status"
          class="inline w-4 h-4 mr-3 text-gray-200 animate-spin dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="#1C64F2"
          />
        </svg>
        Loading...
      </div>
      <div v-else>Send to webhook</div>
    </button>

    <div class="my-12">
      <textarea
        v-model="note"
        id="message"
        rows="18"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
        data-tooltip-target="tooltip-wallet"
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
        data-tooltip-target="tooltip-new"
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
import { ref, watch, onMounted } from "vue";
const recording = ref(false);
const url = ref(null);
const mediaRecorder = ref(null);
const audioChunks = ref([]);
const response = ref("");
const note = ref("");
const sending = ref(false);
const lastNote = ref("");
const audioLevels = ref(Array(10).fill(0));
const recordings = ref([]);
const showModal = ref(false);
const indexAudio = ref(0);
const pendingRequests = ref([]);
const tabs = ref([
  { name: "main", note: "" },
  { name: "tasks", note: "" },
  { name: "calendar", note: "" },
]);
const selectedTab = ref(0);
const selectTab = (tab) => {
  selectedTab.value = tab;
};

watch(note, (newNote) => {
  localStorage.setItem("savedNote", newNote);
});

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("record") === "true") {
    startRecord();
  }
  const savedNote = localStorage.getItem("savedNote");
  if (savedNote) {
    note.value = savedNote;
  }
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

const startRecord = async () => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    recording.value = true;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
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

    mediaRecorder.value = new MediaRecorder(stream);
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
  if (!note.value || sending.value) return;
  sending.value = true;

  try {
    const webhookAddress =
      "https://hook.eu1.make.com/fsiqaia58kx69dlucon8eg8smu1pf10x";
    const data = { text: note.value };
    const response = await fetch(webhookAddress, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    note.value = "";
  } catch (error) {
    alert(error);
    console.error("An error occurred:", error);
  } finally {
    sending.value = false;
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
    .then((data) => {
      const index = pendingRequests.value.indexOf(recording.name);
      if (index > -1) {
        pendingRequests.value.splice(index, 1);
      }
      note.value += `\n${data}`;
      lastNote.value = data;
      navigator.clipboard.writeText(lastNote.value);
      response.value = data.includes("Amara") ? "" : data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const undo = () => {
  note.value = note.value.replace(lastNote.value, "");
};

const copy = () => {
  navigator.clipboard.writeText(note.value);
};

const toggleModal = () => {
  showModal.value = !showModal.value;
};

const clearNote = () => {
  note.value = "";
  localStorage.removeItem("savedNote");
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
</style>
