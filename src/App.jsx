import React, { useState, useEffect, useRef } from 'react';
import { HiKey } from 'react-icons/hi2';
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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tts_stt_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [_, setSttStopRequested] = useState(false); // Only setter used for UI
  const [__, setTtsStopRequested] = useState(false); // Only setter used for UI
  const ttsStopRequestedRef = useRef(false);
  const sttStopRequestedRef = useRef(false);

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

  // Persist API key to localStorage
  useEffect(() => {
    localStorage.setItem('tts_stt_api_key', apiKey);
  }, [apiKey]);

  const handleTTS = async (texts) => {
    setTtsLoading(true);
    setTtsStopRequested(false);
    ttsStopRequestedRef.current = false;
    try {
      for (const text of texts) {
        if (ttsStopRequestedRef.current) break;
        try {
          const data = await ttsRequest(language, [text], apiKey);
          setEntries(prev => [
            { type: 'tts', text: data[0].text, audioBase64: data[0].audioBase64 },
            ...prev
          ]);
        } catch {
          alert(`TTS failed for: ${text}`);
        }
      }
    } finally {
      setTtsLoading(false);
      setTtsStopRequested(false);
      ttsStopRequestedRef.current = false;
    }
  };

  const handleSTT = async (audioFiles) => {
    setSttLoading(true);
    setSttStopRequested(false);
    sttStopRequestedRef.current = false;
    try {
      for (const audioFile of audioFiles) {
        if (sttStopRequestedRef.current) break;
        try {
          const data = await sttRequest(language, audioFile, apiKey);
          const audioBase64 = await fileToBase64(audioFile);
          let cleanTrans = data.transcription_clean || '';
          cleanTrans = cleanTrans
            .split('\n')
            .filter(line => !/^```(text)?/.test(line.trim()))
            .join('\n')
            .trim();
          setEntries(prev => [
            {
              type: 'stt',
              transcription: data.transcription,
              finish_reason: data.finish_reason,
              usage_metadata: data.usage_metadata,
              modelVersion: data.modelVersion,
              transcription_raw: data.transcription_raw,
              transcription_clean: cleanTrans,
              audioBase64,
              fileName: audioFile.name,
            },
            ...prev
          ]);
        } catch {
          alert(`STT failed for: ${audioFile.name}`);
        }
      }
    } finally {
      setSttLoading(false);
      setSttStopRequested(false);
      sttStopRequestedRef.current = false;
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
            <div className="mb-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="w-full bg-white/80 border border-blue-100 shadow-lg rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <HiKey className="text-blue-400 text-xl" />
                  <span className="text-base font-semibold text-gray-700">API Key</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                  <input
                    id="api-key-input"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm text-sm font-mono"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(v => !v)}
                    className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-blue-100 border border-gray-200 transition-all font-mono"
                    tabIndex={-1}
                    title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all local storage and reset the app? This cannot be undone.')) {
                        localStorage.clear();
                        setApiKey('');
                        setEntries([]);
                        setLanguage('');
                        window.location.reload();
                      }
                    }}
                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition-all font-mono"
                    title="Clear all local storage and reset app"
                  >
                    Clear Local Storage
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">Your API key is stored only in your browser and never sent anywhere else.</div>
              </div>
            </div>
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
            {tab === 'tts' && (
              <>
                <TextInputForm onSubmit={handleTTS} loading={ttsLoading} audioEntries={filteredEntries} language={language} />
                {ttsLoading && (
                  <div className="flex justify-end mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTtsStopRequested(true);
                        ttsStopRequestedRef.current = true;
                      }}
                      className="text-xs px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition-all"
                    >
                      Stop
                    </button>
                  </div>
                )}
                <AudioList entries={entries.filter(e => e.type === 'stt')} />
              </>
            )}
            {tab === 'stt' && (
              <>
                <AudioUploadForm onSubmit={handleSTT} loading={sttLoading} language={language} />
                {sttLoading && (
                  <div className="flex justify-end mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSttStopRequested(true);
                        sttStopRequestedRef.current = true;
                      }}
                      className="text-xs px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition-all"
                    >
                      Stop
                    </button>
                  </div>
                )}
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
