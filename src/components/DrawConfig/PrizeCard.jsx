import { Trash2, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';

export default function PrizeCard({
  prize,
  onUpdate,
  onDelete,
  isDrawn,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(prize.name);
  const [editCount, setEditCount] = useState(prize.winnerCount);
  const [editDesc, setEditDesc] = useState(prize.description || '');

  const handleSave = () => {
    if (!editName.trim()) {
      alert('Prize name cannot be empty');
      return;
    }
    if (editCount < 1) {
      alert('Winner count must be at least 1');
      return;
    }
    onUpdate(prize.id, {
      name: editName.trim(),
      winnerCount: parseInt(editCount, 10),
      description: editDesc.trim(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(prize.name);
    setEditCount(prize.winnerCount);
    setEditDesc(prize.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete prize "${prize.name}"?`)) {
      onDelete(prize.id);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isDrawn
          ? 'bg-gray-700 border-gray-600 opacity-60'
          : 'bg-gray-800 border-emerald-500 hover:border-emerald-400'
      }`}
    >
      {!isEditing ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="font-bold text-gray-100 text-lg">{prize.name}</h4>
              <p className="text-sm text-gray-400">
                {prize.winnerCount} {prize.winnerCount === 1 ? 'winner' : 'winners'}
              </p>
              {prize.description && (
                <p className="text-xs text-gray-500 mt-1">{prize.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {!isDrawn && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                    title="Edit prize"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete prize"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              {isDrawn && (
                <span className="text-xs bg-gray-600 px-2 py-1 rounded text-gray-300">
                  Drawn
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">Prize Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="Prize name"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Winner Count</label>
            <input
              type="number"
              value={editCount}
              onChange={(e) => setEditCount(e.target.value)}
              min="1"
              max="50"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Description (Optional)</label>
            <input
              type="text"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g., iPhone 15, Gold Package"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm font-semibold transition-colors"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded text-sm font-semibold transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
