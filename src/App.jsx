import React, { useState, useEffect, useRef } from 'react';
import { HiKey, HiSparkles } from 'react-icons/hi2';
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-0 px-0">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-8 py-8 px-4 md:px-6 lg:px-8">
        {/* Header Card */}
        <div className="w-full bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 transition-all duration-300 hover:shadow-3xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <HiSparkles className="text-white text-2xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 tracking-tight">
                Addis AI Platform
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Text-to-Speech & Speech-to-Text for Amharic and Afan Oromo. 
            </p>
          </div>

          {/* API Key Section */}
          <div className="mb-8">
            <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-xl rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-xl shadow-md">
                  <HiKey className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">API Configuration</h3>
                  <p className="text-sm text-gray-600">Secure access to Addis AI services</p>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-3 items-center">
                <input
                  id="api-key-input"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                  className="flex-1 w-full rounded-xl border border-blue-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 shadow-sm text-sm font-mono transition-all duration-200"
                  autoComplete="off"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(v => !v)}
                    className="px-4 py-2 rounded-xl bg-white/80 text-gray-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
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
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                    title="Clear all local storage and reset app"
                  >
                    Reset App
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Your API key is stored securely in your browser
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <LanguageSelector value={language} onChange={setLanguage} />

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {entries.length > 0 && (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  {entries.length} entries in history
                </span>
              )}
            </div>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => { setEntries([]); localStorage.removeItem('tts_stt_entries'); }}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 border border-gray-200 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Enhanced Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1 shadow-inner">
              <div className="flex gap-1">
                <button
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    tab === 'tts' 
                      ? 'bg-white text-blue-700 shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                  onClick={() => setTab('tts')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tab === 'tts' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    Text-to-Speech
                  </div>
                </button>
                <button
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    tab === 'stt' 
                      ? 'bg-white text-green-700 shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
                  }`}
                  onClick={() => setTab('stt')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tab === 'stt' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    Speech-to-Text
                  </div>
                </button>
                <button
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    tab === 'history' 
                      ? 'bg-white text-gray-700 shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-gray-700 hover:bg-white/50'
                  }`}
                  onClick={() => setTab('history')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tab === 'history' ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                    History
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {tab === 'tts' && (
              <>
                <TextInputForm onSubmit={handleTTS} loading={ttsLoading} audioEntries={filteredEntries} language={language} />
                {ttsLoading && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setTtsStopRequested(true);
                        ttsStopRequestedRef.current = true;
                      }}
                      className="px-6 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                    >
                      Stop Processing
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
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSttStopRequested(true);
                        sttStopRequestedRef.current = true;
                      }}
                      className="px-6 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                    >
                      Stop Processing
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
