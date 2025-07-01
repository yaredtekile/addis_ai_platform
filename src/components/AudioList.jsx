import { HiSpeakerWave, HiMicrophone } from 'react-icons/hi2';
import { HiCheckCircle } from 'react-icons/hi';
import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function AudioList({ entries }) {
  if (!entries.length) return null;

  // Only TTS entries
  const ttsEntries = entries.filter(e => e.type === 'tts');

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    ttsEntries.forEach((entry, idx) => {
      // Add text file
      zip.file(`tts_${idx + 1}.txt`, entry.text);
      // Add audio file (base64 decode)
      zip.file(`tts_${idx + 1}.wav`, entry.audioBase64, { base64: true });
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'tts_results.zip');
  };

  return (
    <div className="space-y-4">
      {ttsEntries.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleDownloadZip}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold shadow hover:bg-blue-700 transition-all text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white"
          >
            Download All as ZIP
          </button>
        </div>
      )}
      {entries.map((entry, idx) => (
        <div
          key={idx}
          className="bg-white border border-green-200 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all hover:shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            {entry.type === 'tts' ? (
              <HiSpeakerWave className="text-blue-500 text-lg" />
            ) : (
              <>
                <HiMicrophone className="text-green-500 text-lg" />
                <HiCheckCircle className="text-green-400 text-lg ml-1" title="Transcription Success" />
              </>
            )}
            <div className="font-semibold text-gray-900 text-sm">
              {entry.type === 'tts' ? 'Text-to-Speech' : 'Speech-to-Text'}
            </div>
            {entry.type === 'stt' && entry.fileName && (
              <span className="ml-2 text-xs text-gray-400 font-mono">{entry.fileName}</span>
            )}
            {entry.type === 'stt' && !entry.fileName && (
              <span className="ml-2 text-xs text-gray-300 font-mono">#{idx + 1}</span>
            )}
          </div>
          <div className="flex-1">
            {entry.type === 'tts' ? (
              <>
                <div className="text-gray-800 mb-1 font-medium text-sm">{entry.text}</div>
                <audio controls src={`data:audio/wav;base64,${entry.audioBase64}`} className="w-full rounded shadow-sm" />
              </>
            ) : (
              <>
                <div className="bg-green-100 border border-green-300 rounded-xl p-4 mb-2 text-green-900 font-semibold text-base whitespace-pre-line shadow-inner tracking-wide">
                  {entry.transcription_clean}
                </div>
                <audio controls src={`data:audio/wav;base64,${entry.audioBase64}`} className="w-full rounded shadow-sm" />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 