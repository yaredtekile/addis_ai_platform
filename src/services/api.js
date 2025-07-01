import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export const ttsRequest = async (language, texts, apiKey) => {
  // texts: array of strings
  // API only supports one text at a time, so send requests in parallel
  const results = await Promise.all(
    texts.map(async (text) => {
      const response = await axios.post(
        `${API_BASE_URL}/audio`,
        { text, language },
        {
          headers: {
            'X-API-Key': apiKey || API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      // response.data.audio is a data:audio/wav;base64,... string
      return { text, audioBase64: response.data.audio.replace(/^data:audio\/wav;base64,/, '') };
    })
  );
  return results;
};

export const sttRequest = async (language, audioFile, apiKey) => {
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