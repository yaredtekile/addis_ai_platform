import { HiMicrophone } from 'react-icons/hi2';
import React, { useRef, useState } from 'react';

export default function AudioUploadForm({ onSubmit, loading, language }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();
  const [error, setError] = useState('');

  const handleFileChange = e => {
    setFiles(Array.from(e.target.files));
  };

  const handleRemoveFile = idx => {
    setFiles(files => files.filter((_, i) => i !== idx));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!language) {
      setError('Please select a language before submitting.');
      return;
    }
    setError('');
    if (files.length) onSubmit(files);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow p-5 mb-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HiMicrophone className="text-green-500 text-xl" />
        <h2 className="text-base font-bold text-gray-900">Speech-to-Text (Batch Upload)</h2>
      </div>
      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:file:ring-2 focus:file:ring-green-200 transition-all"
        multiple
        required={files.length === 0}
      />
      {files.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <div className="font-semibold text-xs text-gray-700 mb-1">Selected Files:</div>
          <ul className="space-y-1">
            {files.map((file, idx) => (
              <li key={idx} className="flex items-center justify-between text-xs text-gray-600 bg-white rounded px-2 py-1 border border-gray-100">
                <span className="truncate max-w-xs">{file.name}</span>
                <button type="button" onClick={() => handleRemoveFile(idx)} className="ml-2 text-red-400 hover:text-red-600 font-bold">&times;</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <div className="text-red-500 text-xs font-semibold mb-2">{error}</div>}
      <button type="submit" disabled={loading || files.length === 0} className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold shadow hover:bg-green-700 transition-all disabled:opacity-50 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white glow-btn-main-stt">{loading ? 'Processing...' : `Send ${files.length || ''} to STT`}</button>
      <style>{`
        .glow-btn-main-stt:hover, .glow-btn-main-stt:focus { box-shadow: 0 0 0 3px #22c55e, 0 2px 8px 0 #22c55e33; }
      `}</style>
    </form>
  );
} 