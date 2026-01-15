import { useState } from 'react';
import { Upload } from 'lucide-react';
import ManualInput from './ManualInput';
import FileUpload from './FileUpload';

/**
 * Candidate Input Mode Selector
 * Toggles between manual text entry and file upload
 * Similar to DrawSettings mode switcher
 */
export default function CandidateInputMode({
  onCandidatesLoaded = () => {},
}) {
  const [mode, setMode] = useState('manual');

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Upload className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">Load Candidates</h3>
      </div>

      {/* Mode Toggle Buttons */}
      <div className="flex gap-2 border-b border-gray-700 pb-4">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 px-4 rounded font-semibold text-sm transition-colors ${
            mode === 'manual'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 py-2 px-4 rounded font-semibold text-sm transition-colors ${
            mode === 'upload'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          File Upload
        </button>
      </div>

      {/* Manual Entry Mode */}
      {mode === 'manual' && (
        <ManualInput onCandidatesLoaded={onCandidatesLoaded} />
      )}

      {/* File Upload Mode */}
      {mode === 'upload' && (
        <FileUpload onCandidatesLoaded={onCandidatesLoaded} />
      )}
    </div>
  );
}
