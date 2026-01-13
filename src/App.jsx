import { useState } from 'react';
import { useLuckyDraw } from './hooks/useLuckyDraw';
import ManualInput from './components/CandidateInput/ManualInput';
import FileUpload from './components/CandidateInput/FileUpload';
import CandidateList from './components/CandidateInput/CandidateList';
import PrizeSetup from './components/DrawConfig/PrizeSetup';
import DrawSettings from './components/DrawConfig/DrawSettings';
import DrawButton from './components/DrawConfig/DrawButton';
import WinnerDisplay from './components/Results/WinnerDisplay';
import ResultActions from './components/Results/ResultActions';
import DrawHistory from './components/History/DrawHistory';
import ForfeitManager from './components/Results/ForfeitManager';
import RedrawHistory from './components/Results/RedrawHistory';

export default function App() {
  const luckyDraw = useLuckyDraw();

  const [prizeLabel, setPrizeLabel] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);
  const [selectedPrizeId, setSelectedPrizeId] = useState(null);
  const [drawError, setDrawError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [forfeitManagerOpen, setForfeitManagerOpen] = useState(false);

  const handleCandidatesLoaded = (candidates) => {
    luckyDraw.setCandidates(candidates);
    setDrawError('');
  };

  const handlePrizeSelect = (prizeId, prizeName = '', count = 1) => {
    setSelectedPrizeId(prizeId);
    if (prizeId) {
      setPrizeLabel(prizeName);
      setWinnerCount(count);
    }
  };

  const handleDraw = async () => {
    try {
      setDrawError('');
      setIsDrawing(true);

      // Simulate brief animation delay
      await new Promise(resolve => setTimeout(resolve, 300));

      luckyDraw.performDraw(winnerCount, prizeLabel, selectedPrizeId);
    } catch (err) {
      setDrawError(err.message);
    } finally {
      setIsDrawing(false);
    }
  };

  const handleUndoLastDraw = () => {
    try {
      luckyDraw.undoLastDraw();
      setDrawError('');
    } catch (err) {
      setDrawError(err.message);
    }
  };

  const handleMarkForfeited = (drawId, winnerName, reason) => {
    try {
      luckyDraw.markWinnerAsForfeited(drawId, winnerName, reason);
      setDrawError('');
    } catch (err) {
      setDrawError(err.message);
    }
  };

  const handleRedraw = (drawId, reason) => {
    try {
      luckyDraw.redrawForfeitedSlots(drawId, reason);
      setDrawError('');
    } catch (err) {
      setDrawError(err.message);
    }
  };

  const handleUndoLastForfeit = (drawId) => {
    try {
      luckyDraw.undoLastForfeit(drawId);
      setDrawError('');
    } catch (err) {
      setDrawError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 w-full overflow-x-hidden">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Lucky Draw
          </h1>
          <p className="text-xl text-gray-400">
            Fast, fair, and fun winner selection for your events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input & Prizes */}
          <div className="lg:col-span-1 space-y-6">
            <ManualInput onCandidatesLoaded={handleCandidatesLoaded} />
            <FileUpload onCandidatesLoaded={handleCandidatesLoaded} />
            <CandidateList
              totalCandidates={luckyDraw.candidateCount}
              availableCandidates={luckyDraw.availableCount}
              onReset={luckyDraw.resetPool}
              onClear={luckyDraw.clearAll}
            />
            <PrizeSetup
              prizes={luckyDraw.prizes}
              onAddPrize={luckyDraw.addPrize}
              onUpdatePrize={luckyDraw.updatePrize}
              onDeletePrize={luckyDraw.deletePrize}
            />
          </div>

          {/* Middle Column: Draw Controls */}
          <div className="lg:col-span-1 space-y-6">
            <DrawSettings
              prizeLabel={prizeLabel}
              winnerCount={winnerCount}
              availableCount={luckyDraw.availableCount}
              onPrizeLabelChange={setPrizeLabel}
              onWinnerCountChange={setWinnerCount}
              prizes={luckyDraw.prizes}
              selectedPrizeId={selectedPrizeId}
              onPrizeSelect={handlePrizeSelect}
            />
            <DrawButton
              isEnabled={luckyDraw.candidateCount > 0}
              isLoading={isDrawing}
              onDraw={handleDraw}
              error={drawError}
            />
          </div>

          {/* Right Column: Results & History */}
          <div className="lg:col-span-1 space-y-6">
            {luckyDraw.currentDraw && (
              <>
                <WinnerDisplay
                  winners={luckyDraw.currentDraw.winners}
                  prizeLabel={luckyDraw.currentDraw.prizeName}
                  timestamp={luckyDraw.currentDraw.timestamp}
                  onManageForfeits={() => setForfeitManagerOpen(true)}
                />
                <ResultActions
                  winners={luckyDraw.currentDraw.winners}
                  prizeLabel={luckyDraw.currentDraw.prizeName}
                />
                {luckyDraw.currentDraw.redrawHistory && luckyDraw.currentDraw.redrawHistory.length > 0 && (
                  <RedrawHistory
                    draw={luckyDraw.currentDraw}
                    onUndoLastForfeit={handleUndoLastForfeit}
                  />
                )}
              </>
            )}

            {/* Forfeit Manager Modal */}
            <ForfeitManager
              isOpen={forfeitManagerOpen}
              onClose={() => setForfeitManagerOpen(false)}
              draw={luckyDraw.currentDraw}
              onMarkForfeited={handleMarkForfeited}
              onRedraw={handleRedraw}
            />

            <DrawHistory
              history={luckyDraw.history}
              onClearHistory={luckyDraw.clearHistory}
              onUndoLastDraw={handleUndoLastDraw}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Lucky Draw App • Built with React + Tailwind CSS</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
