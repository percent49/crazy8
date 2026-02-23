import React from 'react';
import { motion } from 'motion/react';
import { CardData, Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface CardProps {
  card: CardData;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
  isSmall?: boolean;
  backUrl?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  isFaceUp = true,
  onClick,
  isPlayable = false,
  className = '',
  isSmall = false,
  backUrl,
}) => {
  const { suit, rank } = card;

  if (!isFaceUp) {
    return (
      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative ${isSmall ? 'w-12 h-16' : 'w-20 h-28 md:w-24 md:h-36'} bg-emerald-950 rounded-lg border-2 border-white/90 shadow-2xl flex items-center justify-center overflow-hidden ${className}`}
        style={backUrl ? { 
          backgroundImage: `url(${backUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          imageRendering: 'auto'
        } : {}}
      >
        {/* Very subtle vignette to keep the image clear */}
        <div className="absolute inset-0 bg-black/5"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`relative ${isSmall ? 'w-12 h-16' : 'w-20 h-28 md:w-24 md:h-36'} ${
        rank === '8' ? 'bg-yellow-50' : 'bg-white'
      } rounded-lg border-2 ${
        isPlayable ? 'border-yellow-400 cursor-pointer shadow-yellow-400/50' : 'border-gray-200'
      } shadow-xl flex flex-col p-2 select-none overflow-hidden ${className}`}
    >
      <div className={`flex flex-col items-start leading-none ${SUIT_COLORS[suit]}`}>
        <span className={`font-bold ${isSmall ? 'text-xs' : 'text-lg md:text-xl'}`}>{rank}</span>
        <span className={`${isSmall ? 'text-[10px]' : 'text-sm md:text-base'}`}>{SUIT_SYMBOLS[suit]}</span>
      </div>

      <div className={`absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none`}>
        <span className={`${isSmall ? 'text-2xl' : 'text-6xl md:text-7xl'} ${SUIT_COLORS[suit]}`}>
          {SUIT_SYMBOLS[suit]}
        </span>
      </div>

      <div className={`mt-auto flex flex-col items-end leading-none rotate-180 ${SUIT_COLORS[suit]}`}>
        <span className={`font-bold ${isSmall ? 'text-xs' : 'text-lg md:text-xl'}`}>{rank}</span>
        <span className={`${isSmall ? 'text-[10px]' : 'text-sm md:text-base'}`}>{SUIT_SYMBOLS[suit]}</span>
      </div>
    </motion.div>
  );
};
