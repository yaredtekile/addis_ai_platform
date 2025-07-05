import React from 'react';
import { HiGlobeAlt } from 'react-icons/hi2';

const languages = [
  { code: 'am', label: 'Amharic', flag: '🇪🇹' },
  { code: 'om', label: 'Afan Oromo', flag: '🇪🇹' },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
          <HiGlobeAlt className="text-white text-lg" />
        </div>
        <div>
          <label className="block text-lg font-bold text-gray-800">Language Selection</label>
          <p className="text-sm text-gray-600">Choose your target language</p>
        </div>
      </div>
      <div className="relative">
        <select
          className="w-full rounded-xl border border-green-200 p-4 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white/80 shadow-sm text-base font-medium transition-all duration-200 appearance-none cursor-pointer hover:border-green-300"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="" disabled className="text-gray-500">Select a language...</option>
          {languages.map(lang => (
            <option key={lang.code} value={lang.code} className="text-gray-800">
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {value && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {languages.find(lang => lang.code === value)?.label} selected
        </div>
      )}
    </div>
  );
} 