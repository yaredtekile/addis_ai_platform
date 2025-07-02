import { HiSpeakerWave } from 'react-icons/hi2';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function TextInputForm({ onSubmit, loading, audioEntries = [], language }) {
  // If imported, fields: [{en: '...', tr: ''}], else: [{en: '', tr: ''}]
  const [fields, setFields] = useState([{ en: '', tr: '' }]);
  const [imported, setImported] = useState(false);
  const fileInputRef = useRef();
  const [error, setError] = useState('');

  const handleChange = (i, value) => {
    const newFields = [...fields];
    newFields[i].tr = value;
    setFields(newFields);
  };

  const addField = () => setFields([...fields, { en: '', tr: '' }]);
  const removeField = i => setFields(fields.filter((_, idx) => idx !== i));

  const handleSubmit = e => {
    e.preventDefault();
    if (!language) {
      setError('Please select a language before submitting.');
      return;
    }
    setError('');
    onSubmit(fields.map(f => f.tr).filter(Boolean));
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetNames = workbook.SheetNames;
    let pairs = [];
    if (sheetNames.length > 0) {
      const firstSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]], { header: 1 });
      pairs = firstSheet
        .filter(row => row[0])
        .map(row => ({ en: row[0] || '', tr: row[1] || '' }));
    }
    if (pairs.length) {
      setFields(pairs);
      setImported(true);
    }
    e.target.value = '';
  };

  // Helper to find audio for a given text
  const getAudioForText = (text) => {
    return audioEntries.find(e => e.text === text);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow p-5 mb-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HiSpeakerWave className="text-blue-500 text-xl" />
        <h2 className="text-base font-bold text-gray-900">Text-to-Speech</h2>
      </div>
      {fields.map((field, i) => {
        const audio = getAudioForText(field.tr);
        return (
          <div key={i} className="flex flex-col gap-1 mb-3">
            {imported && field.en && (
              <div className="text-xs text-gray-500 font-medium mb-1 pl-1">{field.en}</div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={field.tr}
                onChange={e => handleChange(i, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm text-sm"
                placeholder={imported ? `Translation ${i + 1}` : `Text ${i + 1}`}
                required
              />
              {fields.length > 1 && (
                <button type="button" onClick={() => removeField(i)} className="text-gray-400 hover:text-red-500 transition-colors text-lg font-bold px-2 py-1 rounded-full bg-gray-100 hover:bg-red-50 shadow-sm">&times;</button>
              )}
            </div>
            {audio && (
              <audio controls src={`data:audio/wav;base64,${audio.audioBase64}`} className="w-full mt-1 mb-1 rounded shadow-sm" />
            )}
            {i < fields.length - 1 && <hr className="my-2 border-t border-gray-200" />}
          </div>
        );
      })}
      <div className="flex gap-2 items-center">
        <button type="button" onClick={addField} className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1 hover:bg-blue-100 shadow text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white glow-btn">Add Field</button>
        <button type="button" onClick={handleImportClick} className="bg-gray-100 text-gray-700 rounded-lg px-2 py-1 hover:bg-blue-100 shadow text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white flex items-center gap-1" title="Import Excel"><HiOutlineDocumentArrowDown className="text-blue-500 text-base" /> Import</button>
        <input type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold shadow hover:bg-blue-700 transition-all disabled:opacity-50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white glow-btn-main">{loading ? 'Processing...' : 'Send to TTS'}</button>
      </div>
      {loading && <div className="text-xs text-blue-600 mt-2">Processing... You can stop the process above.</div>}
      {error && <div className="text-red-500 text-xs font-semibold mb-2">{error}</div>}
      <style>{`
        .glow-btn-main:hover, .glow-btn-main:focus { box-shadow: 0 0 0 3px #3b82f6, 0 2px 8px 0 #3b82f633; }
        .glow-btn:hover, .glow-btn:focus { box-shadow: 0 0 0 2px #60a5fa, 0 1px 4px 0 #60a5fa33; }
      `}</style>
    </form>
  );
} 