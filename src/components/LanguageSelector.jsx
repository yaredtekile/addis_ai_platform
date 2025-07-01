import React from 'react';

const languages = [
  { code: 'am', label: 'Amharic' },
  { code: 'om', label: 'Afan Oromo' },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-700">Select Language</label>
      <select
        className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="" disabled>Select a language...</option>
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.label}</option>
        ))}
      </select>
    </div>
  );
} 