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
      @click="clearNote"
      type="button"
      class="text-white px-28 bg-gradient-to-r from-red-500 to-orange-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
    >
      wyczyść
    </button>
    <button
      role="button"
      @click="sendToWebhook"
      type="button"
      class="text-white px-28 bg-gradient-to-br from-green-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
    >
      Send to webhook
    </button>

    <div class="textarea-container">
      <textarea
        class="textarea"
        v-model="note"
        placeholder="Response"
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
              <button @click="sendToWhisper(recording)">Wyślij</button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <svg v-if="recording" viewBox="0 0 100 100" class="audio-circle-visualizer">
      <circle
        v-for="value in audioHistory"
        :key="value"
        r="40"
        cx="50"
        cy="50"
        :stroke-dasharray="`${value}, 100`"
        stroke-width="5"
        fill="none"
        :style="{
          strokeDashoffset: value / 2,
          transform: `rotate(${-90 + (index * 360) / audioHistory.length}deg)`,
          stroke: 'white',
        }"
      />
    </svg>
    <div>
      <button
        @click="toggleModal"
        type="button"
        class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
      >
        Nagrania
      </button>
      <button
        @click="copy"
        type="button"
        class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
      >
        copy note
      </button>
      <button
        @click="undo"
        type="button"
        class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
      >
        undo
      </button>
      <button
        role="button"
        @click="() => (recording ? stopRecord() : startRecord())"
        type="button"
        class="px-32 py-3.5 text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
      >
        {{ recording ? "Stop" : "Record" }}
      </button>
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
.container {
  width: 90%;
  margin: 0 auto;
  height: 100vh;
  position: relative;
}

.action-button {
  border: 0;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-family: "JetBrains Mono", monospace;
  height: 48px;
  justify-content: center;
  overflow: hidden;
  padding: 16px;
  background-image: radial-gradient(
    100% 100% at 100% 0,
    #5adaff 0,
    #e47931 100%
  );
  margin: 20px 5px;
  font-size: 18px;
}

.record-button {
  width: 250px;
  background-image: radial-gradient(
    100% 100% at 100% 0,
    #5adaff 0,
    #5468ff 100%
  );
  margin: 20px 5px;
  padding: 16px 32px;
  align-items: center;
  font-size: 18px;
  // ... (reszta styli dla przycisku)
  &--stop {
    background-image: radial-gradient(100% 100% at 100% 0, red 0, pink 100%);
  }
}

.textarea {
  width: 96%;
  min-height: 250px;
  box-sizing: border-box;
  border: none;
  background-color: transparent;
  font-size: 16px;
  color: white;
  resize: none;
}

.send-button {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 16px 32px;
  text-align: center;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
}

.record-button-wrapper {
  position: absolute;
  padding: 16px 32px;
  width: 80vw;
  left: 50%;
  transform: translateX(-50%);
  bottom: 50px;
}
.loading-spinner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); // półprzezroczyste tło
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; // aby upewnić się, że jest na wierzchu
}

.spinner {
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db; // Niebieski kolor
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.audio-circle-visualizer {
  width: 200px;
  height: 200px;
  margin: 20px auto;

  circle {
    transition: stroke-dashoffset 0.05s;
  }
}
.recordings-list {
  // ... istniejące style

  button {
    background-color: #4caf50;
    border: none;
    color: white;
    padding: 5px 10px;
    margin-left: 10px;
    cursor: pointer;
    border-radius: 4px;
    &:hover {
      background-color: #45a049;
    }
  }
}
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
