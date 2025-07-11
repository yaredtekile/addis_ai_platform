import { HiMicrophone, HiXMark, HiCloudArrowUp } from 'react-icons/hi2';
import React, { useRef, useState } from 'react';

export default function AudioUploadForm({ onSubmit, loading, language, apiKey }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

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
    if (!apiKey){
      setError('Please enter your API key before submitting.');
      return;
    }
    setError('');
    if (files.length) onSubmit(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('audio/')
    );
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl shadow-xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
          <HiMicrophone className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Speech-to-Text</h2>
          <p className="text-sm text-gray-600">Convert audio files to text</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragOver 
              ? 'border-green-400 bg-green-50/50' 
              : 'border-green-200 hover:border-green-300 bg-white/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <HiCloudArrowUp className="text-green-600 text-2xl" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 mb-1">
                Drop audio files here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports MP3, WAV, M4A, and other audio formats
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
            >
              Choose Files
            </button>
          </div>
          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            required={files.length === 0}
          />
        </div>

        {files.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">Selected Files ({files.length})</h3>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="ml-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                    title="Remove file"
                  >
                    <HiXMark className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || files.length === 0} 
          className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 hover:shadow-xl transform hover:scale-105"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing {files.length} file{files.length !== 1 ? 's' : ''}...
            </div>
          ) : (
            `Convert ${files.length || 0} Audio File${files.length !== 1 ? 's' : ''} to Text`
          )}
        </button>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Processing your audio files... You can stop the process above.
          </div>
        )}
      </form>
    </div>
  );
} 