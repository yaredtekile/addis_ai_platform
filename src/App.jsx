import React, { useState, useEffect } from 'react';
import LanguageSelector from './components/LanguageSelector';
import TextInputForm from './components/TextInputForm';
import AudioUploadForm from './components/AudioUploadForm';
import AudioList from './components/AudioList';
import { ttsRequest, sttRequest } from './services/api';
import './App.css';

function App() {
  const [language, setLanguage] = useState('');
  const [entries, setEntries] = useState([]); // {type, text, audioBase64} or {type, transcription, audioBase64}
  const [ttsLoading, setTtsLoading] = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const [tab, setTab] = useState('tts');

  // Helper: convert File to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Load entries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tts_stt_entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        setEntries([]);
      }
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tts_stt_entries', JSON.stringify(entries));
  }, [entries]);

  const handleTTS = async (texts) => {
    setTtsLoading(true);
    try {
      const data = await ttsRequest(language, texts);
      setEntries(prev => [
        ...data.map(d => ({ type: 'tts', text: d.text, audioBase64: d.audioBase64 })),
        ...prev
      ]);
    } catch {
      alert('TTS failed.');
    } finally {
      setTtsLoading(false);
    }
  };

  const handleSTT = async (audioFiles) => {
    setSttLoading(true);
    try {
      const results = await Promise.all(audioFiles.map(async (audioFile) => {
        const data = await sttRequest(language, audioFile);
        const audioBase64 = await fileToBase64(audioFile);
        let cleanTrans = data.transcription_clean || '';
        cleanTrans = cleanTrans
          .split('\n')
          .filter(line => !/^```(text)?/.test(line.trim()))
          .join('\n')
          .trim();
        return {
          type: 'stt',
          transcription: data.transcription,
          finish_reason: data.finish_reason,
          usage_metadata: data.usage_metadata,
          modelVersion: data.modelVersion,
          transcription_raw: data.transcription_raw,
          transcription_clean: cleanTrans,
          audioBase64,
          fileName: audioFile.name,
        };
      }));
      setEntries(prev => [
        ...results,
        ...prev
      ]);
    } catch {
      alert('STT failed.');
    } finally {
      setSttLoading(false);
    }
  };

  // Filter entries for the current tab
  const filteredEntries = tab === 'history' ? entries : entries.filter(e => (tab === 'tts' ? e.type === 'tts' : e.type === 'stt'));

  return (
    <div className="min-h-screen w-full bg-white py-0 px-0">
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 py-10 px-2 md:px-0">
        <div className="w-full bg-gray-50 border border-gray-200 shadow-xl rounded-2xl p-6 md:p-10 transition-all duration-300">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2 text-gray-900 tracking-tight">Addis AI TTS & STT</h1>
          <p className="text-center text-base text-gray-500 mb-8">Text-to-Speech & Speech-to-Text for Amharic and Afan Oromo. Powered by Addis AI.</p>
          <div className="flex flex-col gap-6">
            <LanguageSelector value={language} onChange={setLanguage} />
            {/* Clear History Button */}
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => { setEntries([]); localStorage.removeItem('tts_stt_entries'); }}
                className="text-xs px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 border border-gray-200 transition-all"
              >
                Clear History
              </button>
            </div>
            {/* Tabs */}
            <div className="flex justify-center mb-4 gap-2">
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all border-b-2 ${tab === 'tts' ? 'border-blue-600 text-blue-700 bg-white shadow' : 'border-transparent text-gray-500 bg-gray-100 hover:text-blue-600'}`}
                onClick={() => setTab('tts')}
              >
                Text-to-Speech
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all border-b-2 ${tab === 'stt' ? 'border-green-600 text-green-700 bg-white shadow' : 'border-transparent text-gray-500 bg-gray-100 hover:text-green-600'}`}
                onClick={() => setTab('stt')}
              >
                Speech-to-Text
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all border-b-2 ${tab === 'history' ? 'border-gray-600 text-gray-700 bg-white shadow' : 'border-transparent text-gray-500 bg-gray-100 hover:text-gray-600'}`}
                onClick={() => setTab('history')}
              >
                History
              </button>
            </div>
            {/* Tab content */}
            {tab === 'tts' && <TextInputForm onSubmit={handleTTS} loading={ttsLoading} audioEntries={filteredEntries} language={language} />}
            {tab === 'stt' && (
              <>
                <AudioUploadForm onSubmit={handleSTT} loading={sttLoading} language={language} />
                <AudioList entries={entries.filter(e => e.type === 'stt')} />
              </>
            )}
            {tab === 'history' && <AudioList entries={filteredEntries} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
