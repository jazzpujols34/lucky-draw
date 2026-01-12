import { useState } from 'react';
import { Plus } from 'lucide-react';
import PrizeCard from './PrizeCard';

export default function PrizeSetup({
  prizes = [],
  drawnPrizeIds = [],
  onAddPrize,
  onUpdatePrize,
  onDeletePrize,
}) {
  const [formName, setFormName] = useState('');
  const [formCount, setFormCount] = useState(1);
  const [formDesc, setFormDesc] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddPrize = () => {
    if (!formName.trim()) {
      alert('Prize name cannot be empty');
      return;
    }
    if (formCount < 1) {
      alert('Winner count must be at least 1');
      return;
    }

    onAddPrize(formName.trim(), parseInt(formCount, 10), formDesc.trim());
    setFormName('');
    setFormCount(1);
    setFormDesc('');
    setShowForm(false);
  };

  const activePrizes = prizes.filter(p => p.status === 'active');
  const drawnPrizes = prizes.filter(p => p.status === 'drawn');

  return (
    <div className="card p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-100">Prize Configuration</h3>

      {/* Add Prize Form */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Prize
          </button>
        ) : (
          <>
            <div>
              <label className="text-xs text-gray-400">Prize Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., iPhone 15, Laptop, Gold Package"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Winner Count *</label>
                <input
                  type="number"
                  value={formCount}
                  onChange={(e) => setFormCount(e.target.value)}
                  min="1"
                  max="50"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddPrize}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-semibold transition-colors"
              >
                Add Prize
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormName('');
                  setFormCount(1);
                  setFormDesc('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* Active Prizes */}
      {activePrizes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-emerald-400">Active Prizes ({activePrizes.length})</h4>
          <div className="space-y-3">
            {activePrizes.map((prize) => (
              <PrizeCard
                key={prize.id}
                prize={prize}
                isDrawn={false}
                onUpdate={onUpdatePrize}
                onDelete={onDeletePrize}
              />
            ))}
          </div>
        </div>
      )}

      {/* Drawn Prizes */}
      {drawnPrizes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-500">Drawn Prizes ({drawnPrizes.length})</h4>
          <div className="space-y-3">
            {drawnPrizes.map((prize) => (
              <PrizeCard
                key={prize.id}
                prize={prize}
                isDrawn={true}
                onUpdate={onUpdatePrize}
                onDelete={onDeletePrize}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {prizes.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No prizes configured yet. Add your first prize above!</p>
        </div>
      )}

      {/* Prize Count Summary */}
      {prizes.length > 0 && (
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 text-center text-sm">
          <p className="text-gray-300">
            <span className="font-semibold text-emerald-400">{activePrizes.length}</span> active •{' '}
            <span className="font-semibold text-gray-500">{drawnPrizes.length}</span> drawn
          </p>
        </div>
      )}
    </div>
  );
}
