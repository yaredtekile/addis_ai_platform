import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export const ttsRequest = async (language, text, apiKey, signal) => {
  // text: single string
  const response = await axios.post(
    `${API_BASE_URL}/audio`,
    { text, language },
    {
      headers: {
        'X-API-Key': apiKey || API_KEY,
        'Content-Type': 'application/json',
      },
      signal,
    }
  );
  // response.data.audio is a data:audio/wav;base64,... string
  return { text, audioBase64: response.data.audio.replace(/^data:audio\/wav;base64,/, '') };
};

export const sttRequest = async (language, audioFile, apiKey, signal) => {
  const formData = new FormData();
  formData.append('chat_audio_input', audioFile);
  formData.append('request_data', JSON.stringify({ target_language: language }));
  const response = await axios.post(
    `${API_BASE_URL}/chat_generate`,
    formData,
    {
      headers: {
        'X-API-Key': apiKey || API_KEY,
        // 'Content-Type' will be set automatically by Axios for FormData
      },
      signal,
    }
  );
  const data = response.data.data || response.data;
  return {
    transcription: data.response_text,
    finish_reason: data.finish_reason,
    usage_metadata: data.usage_metadata,
    modelVersion: data.modelVersion,
    transcription_raw: data.transcription_raw,
    transcription_clean: data.transcription_clean,
  };
};

// IndexedDB utility for key-value storage
const DB_NAME = 'addis_ai_platform_db';
const STORE_NAME = 'keyval';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbRemove(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbClear() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
} 