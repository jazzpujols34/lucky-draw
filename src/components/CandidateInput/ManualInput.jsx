import { useState } from 'react';
import { parseManualInput } from '../../utils/fileParser';

export default function ManualInput({ onCandidatesLoaded }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleParse = () => {
    try {
      setError('');
      const candidates = parseManualInput(input);

      if (candidates.length === 0) {
        setError('No valid candidates found. Please enter at least one name.');
        return;
      }

      onCandidatesLoaded(candidates);
      setInput('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-2xl font-bold text-emerald-400">Manual Input</h3>

      <div className="space-y-2">
        <p className="text-sm text-gray-300">
          Enter names one per line, or comma-separated:
        </p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TW-Andy&#10;SG-Mike&#10;MY-Jane&#10;&#10;Or: TW-Andy, SG-Mike, MY-Jane"
          className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded">{error}</div>}

      <button
        onClick={handleParse}
        className="btn-primary w-full text-lg py-3"
      >
        Load Candidates
      </button>
    </div>
  );
}
