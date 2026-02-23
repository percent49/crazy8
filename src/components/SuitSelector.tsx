import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS, SUIT_LABELS } from '../constants';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
  onCancel: () => void;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect, onCancel }) => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">选择一个花色</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-100 hover:border-yellow-400 hover:bg-yellow-50 transition-all group`}
            >
              <span className={`text-5xl mb-2 ${SUIT_COLORS[suit]} group-hover:scale-110 transition-transform`}>
                {SUIT_SYMBOLS[suit]}
              </span>
              <span className="text-gray-600 font-medium">{SUIT_LABELS[suit]}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
