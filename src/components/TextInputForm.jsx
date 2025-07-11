import { HiSpeakerWave, HiPlus, HiXMark } from 'react-icons/hi2';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function TextInputForm({ onSubmit, loading, audioEntries = [], language, apiKey }) {
  // If imported, fields: [{en: '...', tr: ''}], else: [{en: '', tr: ''}]
  const [fields, setFields] = useState([{ en: '', tr: '' }]);
  const [imported, setImported] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
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
    if (!apiKey){
      setError('Please enter your API key before submitting.');
      return;
    }
    setError('');
    onSubmit(fields.map(f => f.tr).filter(Boolean));
  };

  const handleImportClick = () => {
    setShowInstructions(false);
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl shadow-xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <HiSpeakerWave className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Text-to-Speech</h2>
          <p className="text-sm text-gray-600">Convert text to natural speech</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field, i) => {
          const audio = getAudioForText(field.tr);
          return (
            <div key={i} className="bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              {imported && field.en && (
                <div className="text-xs text-gray-500 font-medium mb-2 px-2 py-1 bg-gray-100 rounded-lg inline-block">
                  {field.en}
                </div>
              )}
              <div className="flex items-center gap-3">
                <textarea
                  value={field.tr}
                  onChange={e => handleChange(i, e.target.value)}
                  className="flex-1 rounded-lg border border-blue-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm text-sm transition-all duration-200 resize-none max-h-[10rem]"
                  placeholder={imported ? `Translation ${i + 1}` : `Enter text ${i + 1}...`}
                  required
                  rows={1}
                  style={{height: 'auto', maxHeight: '10rem'}}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 10 * 16) + 'px';
                  }}
                />
                {fields.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeField(i)} 
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    title="Remove field"
                  >
                    <HiXMark className="text-lg" />
                  </button>
                )}
              </div>
              {audio && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <audio 
                    controls 
                    src={`data:audio/wav;base64,${audio.audioBase64}`} 
                    className="w-full rounded-lg shadow-sm" 
                  />
                </div>
              )}
            </div>
          );
        })}

        <div className="flex flex-wrap gap-3 items-center pt-2">
          <button 
            type="button" 
            onClick={addField} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 shadow-sm text-sm font-medium transition-all duration-200 hover:shadow-md"
          >
            <HiPlus className="text-base" />
            Add Field
          </button>
          
          {/* Import Excel Section with Instructions */}
          <div className="relative group">
            <button 
              type="button" 
              onClick={() => setShowInstructions(!showInstructions)} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-blue-100 hover:text-blue-700 shadow-sm text-sm font-medium transition-all duration-200 hover:shadow-md" 
              title="Import Excel file"
            >
              <HiOutlineDocumentArrowDown className="text-base" />
              Import Excel
            </button>
          </div>
          
          {/* Toggle Instructions */}
          {showInstructions && (
            <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 mt-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex-shrink-0 shadow-sm">
                  <HiOutlineDocumentArrowDown className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">📋 Excel Format Required:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 shadow-sm">
                      <div className="font-semibold text-gray-800 mb-1">Column A</div>
                      <div className="text-gray-700">English text</div>
                      <div className="text-xs text-gray-600 mt-1">(can be empty)</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 shadow-sm">
                      <div className="font-semibold text-gray-800 mb-1">Column B</div>
                      <div className="text-gray-700">
                        {language === 'am' ? 'Amharic' : language === 'om' ? 'Afan Oromo' : 'Amharic/Afan Oromo'} text
                      </div>
                      <div className="text-xs text-gray-600 mt-1">(required)</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-700 bg-white/60 backdrop-blur-sm rounded-lg p-2 mb-3 border border-blue-200/50">
                    💡 <strong>Important:</strong> Column A can be empty, but Column B must contain the text you want to convert to speech.
                  </div>
                  <button
                    type="button"
                    onClick={handleImportClick}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                  >
                    Choose Excel File
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              'Convert to Speech'
            )}
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Processing your text... You can stop the process above.
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {error}
          </div>
        )}
      </form>
    </div>
  );
} 