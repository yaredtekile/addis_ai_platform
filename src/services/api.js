import axios from 'axios';

const API_BASE_URL_V1 = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL_V2 = import.meta.env.VITE_API_BASE_URL_V2 || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Function to get the appropriate base URL based on version
const getApiBaseUrl = (version = 'v1') => {
  return version === 'v2' ? API_BASE_URL_V2 : API_BASE_URL_V1;
};

export const ttsRequest = async (language, text, apiKey, signal, version = 'v1') => {
  // text: single string
  const response = await axios.post(
    `${getApiBaseUrl(version)}/audio`,
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

export const sttRequest = async (language, audioFile, apiKey, signal, version = 'v2') => {
  const formData = new FormData();
  
  if (version === 'v2') {
    // V2 format: audio field and request_data with language_code
    formData.append('audio', audioFile);
    formData.append('request_data', JSON.stringify({ language_code: language }));
  } else {
    // V1 format: chat_audio_input and request_data with target_language
    formData.append('chat_audio_input', audioFile);
    formData.append('request_data', JSON.stringify({ target_language: language }));
  }
  
  const response = await axios.post(
    `${getApiBaseUrl(version)}${version === 'v2' ? '/stt' : '/chat_generate'}`,
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
  
  if (version === 'v2') {
    // V2 format: transcription is directly in data.transcription
    return {
      transcription: data.transcription,
      usage_metadata: data.usage_metadata,
      confidence: data.confidence,
      // For V2, we'll use transcription as both raw and clean since there's no separate field
      transcription_raw: data.transcription,
      transcription_clean: data.transcription,
      finish_reason: 'completed', // V2 doesn't provide this, so we set a default
      modelVersion: 'v2' // V2 doesn't provide this, so we set a default
    };
  } else {
    // V1 format: response_text and other fields
    return {
      transcription: data.response_text,
      finish_reason: data.finish_reason,
      usage_metadata: data.usage_metadata,
      modelVersion: data.modelVersion,
      transcription_raw: data.transcription_raw,
      transcription_clean: data.transcription_clean,
    };
  }
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