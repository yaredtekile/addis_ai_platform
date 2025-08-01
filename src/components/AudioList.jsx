import { HiSpeakerWave, HiMicrophone, HiCheckCircle, HiDocumentArrowDown } from 'react-icons/hi2';
import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function AudioList({ entries }) {
  const [sttFilter, setSttFilter] = useState('all'); // 'all', 'v1', 'v2'
  
  if (!entries.length) return null;

  // Filter entries by type
  const ttsEntries = entries.filter(e => e.type === 'tts');
  const allSttEntries = entries.filter(e => e.type === 'stt');
  
  // Filter STT entries by version
  const sttEntries = sttFilter === 'all' 
    ? allSttEntries 
    : allSttEntries.filter(e => {
        if (sttFilter === 'v1') {
          return e.modelVersion === 'v1' || e.modelVersion === 'Addis-፩-አሌፍ';
        } else if (sttFilter === 'v2') {
          return e.modelVersion === 'v2';
        }
        return true;
      });

  // Helper for toggling long text
  function ExpandableText({ text, maxLength = 100 }) {
    const [expanded, setExpanded] = useState(false);
    if (!text || text.length <= maxLength) return <span>{text}</span>;
    return (
      <>
        <span>{expanded ? text : text.slice(0, maxLength) + '...'}</span>
        <button
          className="ml-2 text-blue-600 underline text-xs focus:outline-none"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </>
    );
  }

  const handleDownloadTTSZip = async () => {
    const zip = new JSZip();
    
    // Create TTS folder
    const ttsFolder = zip.folder('tts_results');
    
    ttsEntries.forEach((entry, idx) => {
      // Create individual folder for each TTS entry
      const entryFolder = ttsFolder.folder(`tts_${idx + 1}`);
      
      // Add text file
      entryFolder.file('text.txt', entry.text);
      // Add audio file (base64 decode)
      entryFolder.file('audio.wav', entry.audioBase64, { base64: true });
      // Add metadata
      const metadata = {
        type: 'tts',
        text: entry.text,
        timestamp: new Date().toISOString(),
        index: idx + 1
      };
      entryFolder.file('metadata.json', JSON.stringify(metadata, null, 2));
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'tts_results.zip');
  };

  const handleDownloadSTTZip = async () => {
    const zip = new JSZip();
    
    // Create STT folder
    const sttFolder = zip.folder('stt_results');
    
    sttEntries.forEach((entry, idx) => {
      // Create individual folder for each STT entry
      const fileName = entry.fileName ? entry.fileName.replace(/\.[^/.]+$/, '') : `stt_${idx + 1}`;
      const entryFolder = sttFolder.folder(fileName);
      
      // Add transcription file
      entryFolder.file('transcription.txt', entry.transcription_clean);
      // Add audio file (base64 decode)
      entryFolder.file('audio.wav', entry.audioBase64, { base64: true });
      // Add metadata file
      const metadata = {
        type: 'stt',
        fileName: entry.fileName,
        transcription: entry.transcription_clean,
        modelVersion: entry.modelVersion,
        finish_reason: entry.finish_reason,
        usage_metadata: entry.usage_metadata,
        timestamp: new Date().toISOString(),
        index: idx + 1
      };
      entryFolder.file('metadata.json', JSON.stringify(metadata, null, 2));
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'stt_results.zip');
  };

  const handleDownloadAllZip = async () => {
    const zip = new JSZip();
    
    // Create main folder with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const mainFolder = zip.folder(`addis_ai_results_${timestamp}`);
    
    // Create TTS folder
    const ttsFolder = mainFolder.folder('tts_results');
    ttsEntries.forEach((entry, idx) => {
      const entryFolder = ttsFolder.folder(`tts_${idx + 1}`);
      entryFolder.file('text.txt', entry.text);
      entryFolder.file('audio.wav', entry.audioBase64, { base64: true });
      const metadata = {
        type: 'tts',
        text: entry.text,
        timestamp: new Date().toISOString(),
        index: idx + 1
      };
      entryFolder.file('metadata.json', JSON.stringify(metadata, null, 2));
    });
    
    // Create STT folder
    const sttFolder = mainFolder.folder('stt_results');
    sttEntries.forEach((entry, idx) => {
      const fileName = entry.fileName ? entry.fileName.replace(/\.[^/.]+$/, '') : `stt_${idx + 1}`;
      const entryFolder = sttFolder.folder(fileName);
      entryFolder.file('transcription.txt', entry.transcription_clean);
      entryFolder.file('audio.wav', entry.audioBase64, { base64: true });
      const metadata = {
        type: 'stt',
        fileName: entry.fileName,
        transcription: entry.transcription_clean,
        modelVersion: entry.modelVersion,
        finish_reason: entry.finish_reason,
        usage_metadata: entry.usage_metadata,
        timestamp: new Date().toISOString(),
        index: idx + 1
      };
      entryFolder.file('metadata.json', JSON.stringify(metadata, null, 2));
    });
    
    // Add summary file
    const summary = {
      totalEntries: entries.length,
      ttsCount: ttsEntries.length,
      sttCount: sttEntries.length,
      exportDate: new Date().toISOString(),
      platform: 'Addis AI Platform'
    };
    mainFolder.file('summary.json', JSON.stringify(summary, null, 2));
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `addis_ai_results_${timestamp}.zip`);
  };

  return (
    <div className="space-y-6">
      {/* Download Buttons Section */}
      {(ttsEntries.length > 0 || sttEntries.length > 0) && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <HiDocumentArrowDown className="text-gray-600 text-lg" />
              <span className="font-semibold text-gray-800">Download Results</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ttsEntries.length > 0 && (
                <button
                  onClick={handleDownloadTTSZip}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  title={`Download ${ttsEntries.length} TTS result${ttsEntries.length !== 1 ? 's' : ''} in organized folders`}
                >
                  <HiSpeakerWave className="text-sm" />
                  TTS ({ttsEntries.length})
                </button>
              )}
              {sttEntries.length > 0 && (
                <button
                  onClick={handleDownloadSTTZip}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  title={`Download ${sttEntries.length} STT result${sttEntries.length !== 1 ? 's' : ''} in organized folders`}
                >
                  <HiMicrophone className="text-sm" />
                  STT ({sttEntries.length})
                </button>
              )}
              {ttsEntries.length > 0 && sttEntries.length > 0 && (
                <button
                  onClick={handleDownloadAllZip}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  title="Download all results in organized folders with timestamp"
                >
                  <HiDocumentArrowDown className="text-sm" />
                  All ({entries.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* STT Version Filter */}
      {allSttEntries.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Filter STT by Version:</span>
            <select
              value={sttFilter}
              onChange={(e) => setSttFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-medium bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
            >
              <option value="all">All Versions ({allSttEntries.length})</option>
              <option value="v1">V1 ({allSttEntries.filter(e => e.modelVersion === 'v1' || e.modelVersion === 'Addis-፩-አሌፍ').length})</option>
              <option value="v2">V2 ({allSttEntries.filter(e => e.modelVersion === 'v2').length})</option>
            </select>
            {sttFilter !== 'all' && (
              <span className="text-xs text-gray-500">
                Showing {sttEntries.length} of {allSttEntries.length} STT entries
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {[...ttsEntries, ...sttEntries].map((entry, idx) => (
          <div
            key={idx}
            className={`bg-white/90 backdrop-blur-sm border rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
              entry.type === 'tts' 
                ? 'border-blue-200/50 hover:border-blue-300/50' 
                : 'border-green-200/50 hover:border-green-300/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl shadow-md ${
                entry.type === 'tts' 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                  : 'bg-gradient-to-br from-green-500 to-emerald-600'
              }`}>
                {entry.type === 'tts' ? (
                  <HiSpeakerWave className="text-white text-lg" />
                ) : (
                  <div className="flex items-center gap-1">
                    <HiMicrophone className="text-white text-lg" />
                    <HiCheckCircle className="text-white text-sm" title="Transcription Success" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-base">
                  {entry.type === 'tts' ? 'Text-to-Speech' : 'Speech-to-Text'}
                </div>
                {entry.type === 'stt' && entry.fileName && (
                  <div className="text-sm text-gray-500 font-mono">{entry.fileName}</div>
                )}
                {entry.type === 'stt' && !entry.fileName && (
                  <div className="text-sm text-gray-400 font-mono">#{idx + 1}</div>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                entry.type === 'tts' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {entry.type === 'tts' ? 'TTS' : 'STT'}
              </div>
            </div>

            <div className="space-y-4">
              {entry.type === 'tts' ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-gray-800 font-medium text-base leading-relaxed">
                      <ExpandableText text={entry.text} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <audio 
                      controls 
                      src={`data:audio/wav;base64,${entry.audioBase64}`} 
                      className="w-full rounded-lg shadow-sm" 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="text-green-900 font-semibold text-base leading-relaxed whitespace-pre-line tracking-wide">
                      <ExpandableText text={entry.transcription_clean} />
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <audio 
                      controls 
                      src={`data:audio/wav;base64,${entry.audioBase64}`} 
                      className="w-full rounded-lg shadow-sm" 
                    />
                  </div>
                  {entry.modelVersion && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Model: {entry.modelVersion}
                    </div>
                  )}
                  {entry.confidence && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Confidence: {(entry.confidence * 100).toFixed(1)}%
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 