import React from 'react';

const SttVersionSelector = ({ selectedVersion, onVersionChange }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <label className="text-xs text-gray-600 font-medium">
        STT Version:
      </label>
      <select
        value={selectedVersion}
        onChange={(e) => onVersionChange(e.target.value)}
        className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
      >
        <option value="v1">V1</option>
        <option value="v2">V2</option>
      </select>
    </div>
  );
};

export default SttVersionSelector; 