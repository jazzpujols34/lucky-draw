import { Copy, Download, Share2 } from 'lucide-react';
import { useState } from 'react';
import { winnersToText, copyToClipboard, downloadWinnersCSV } from '../../utils/exporter';

export default function ResultActions({ winners, prizeLabel }) {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    const text = winnersToText(winners, prizeLabel);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadWinnersCSV(winners, prizeLabel);
  };

  const handleShare = async () => {
    const text = winnersToText(winners, prizeLabel);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lucky Draw Winners',
          text: text,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <div className="card p-6 space-y-3">
      <h4 className="font-semibold text-gray-300">Actions</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={handleCopyToClipboard}
          className="btn-secondary flex items-center justify-center gap-2 py-3"
        >
          <Copy className="w-5 h-5" />
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <button
          onClick={handleDownload}
          className="btn-secondary flex items-center justify-center gap-2 py-3"
        >
          <Download className="w-5 h-5" />
          Download CSV
        </button>

        {navigator.share && (
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        )}
      </div>
    </div>
  );
}
