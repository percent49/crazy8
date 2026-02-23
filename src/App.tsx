/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CardData, 
  Suit, 
  GameState, 
  GameStatus,
  Player
} from './types';
import { 
  createDeck, 
  shuffle, 
  SUIT_SYMBOLS, 
  SUIT_COLORS, 
  SUIT_LABELS,
  FAMOUS_NAMES,
  STARCRAFT_UNITS
} from './constants';
import { Card } from './components/Card';
import { SuitSelector } from './components/SuitSelector';
import { Trophy, RotateCcw, Info, User, Cpu, Layers, Users } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    discardPile: [],
    players: [],
    currentTurnIndex: 0,
    status: 'setup',
    currentSuit: null,
    lastAction: '欢迎来到 Bavel的疯狂8点！',
    winnerId: null,
    cardBackUrl: '',
  });
  const [pendingWildCard, setPendingWildCard] = useState<CardData | null>(null);
  const [stats, setStats] = useState({ games: 0, wins: 0, losses: 0 });

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('crazy8_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Failed to parse stats', e);
      }
    }
  }, []);

  // Save stats to localStorage
  const updateStats = useCallback((isWin: boolean) => {
    setStats(prev => {
      const newStats = {
        games: prev.games + 1,
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: isWin ? prev.losses : prev.losses + 1
      };
      localStorage.setItem('crazy8_stats', JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  // Gentle victory sound using Web Audio API
  const playVictorySound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      // A gentle arpeggio
      playNote(523.25, ctx.currentTime, 0.5); // C5
      playNote(659.25, ctx.currentTime + 0.1, 0.5); // E5
      playNote(783.99, ctx.currentTime + 0.2, 0.5); // G5
      playNote(1046.50, ctx.currentTime + 0.3, 0.8); // C6
    } catch (e) {
      console.warn('Audio context failed', e);
    }
  };

  const playPeacefulFireworks = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 0, colors: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6'] };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 30 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const DEFEAT_REMARKS = [
    "哎呀，AI 刚才是不是偷偷看你牌了？",
    "胜败乃兵家常事，大侠请重新来过。",
    "这局 AI 运气确实好那么一点点。",
    "差一点就赢了，手感正在发热中！",
    "AI 表示：承让承让，下次我轻点。",
    "牌局如人生，偶尔摸到烂牌也是一种修行。"
  ];

  const sortHand = useCallback((hand: CardData[]) => {
    const SUIT_ORDER: Record<Suit, number> = {
      spades: 0,
      hearts: 1,
      clubs: 2,
      diamonds: 3,
    };

    return [...hand].sort((a, b) => {
      // 8s go to the right
      if (a.rank === '8' && b.rank !== '8') return 1;
      if (a.rank !== '8' && b.rank === '8') return -1;
      
      // If both are 8s or both are not 8s, sort by suit
      if (a.suit !== b.suit) {
        return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
      }
      
      // If same suit, sort by rank
      const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });
  }, []);

  const initGame = useCallback((playerCount: number = 2) => {
    const deck = shuffle(createDeck());
    const players: Player[] = [];
    const aiNames = shuffle(FAMOUS_NAMES);
    const randomUnit = STARCRAFT_UNITS[Math.floor(Math.random() * STARCRAFT_UNITS.length)];

    // Create human player
    players.push({
      id: 0,
      name: '你',
      isHuman: true,
      hand: sortHand(deck.splice(0, 8)),
    });

    // Create AI players
    for (let i = 1; i < playerCount; i++) {
      players.push({
        id: i,
        name: `${aiNames[i - 1]} (AI)`,
        isHuman: false,
        hand: deck.splice(0, 8),
      });
    }
    
    // Initial discard pile card cannot be an 8
    let firstCardIndex = deck.findIndex(c => c.rank !== '8');
    if (firstCardIndex === -1) firstCardIndex = 0;
    const discardPile = [deck.splice(firstCardIndex, 1)[0]];

    setGameState({
      deck,
      discardPile,
      players,
      currentTurnIndex: 0,
      status: 'playing',
      currentSuit: null,
      lastAction: '游戏开始！你的回合。',
      winnerId: null,
      cardBackUrl: randomUnit.url,
    });
    setPendingWildCard(null);
  }, [sortHand]);

  const isValidMove = (card: CardData, topCard: CardData | null, currentSuit: Suit | null) => {
    if (card.rank === '8') return true;
    if (!topCard) return false;
    const targetSuit = currentSuit || topCard.suit;
    return card.suit === targetSuit || card.rank === topCard.rank;
  };

  const handlePlayerPlay = (card: CardData) => {
    if (!gameState || gameState.status !== 'playing') return;
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (!currentPlayer.isHuman) return;

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!isValidMove(card, topCard, gameState.currentSuit)) return;

    if (card.rank === '8') {
      setPendingWildCard(card);
      setGameState(prev => ({ ...prev, status: 'waiting_for_suit' }));
    } else {
      playCard(card, gameState.currentTurnIndex);
    }
  };

  const playCard = (card: CardData, playerIndex: number, newSuit: Suit | null = null) => {
    setGameState(prev => {
      const currentPlayer = prev.players[playerIndex];
      const newHand = currentPlayer.hand.filter(c => c.id !== card.id);
      const newDiscardPile = [...prev.discardPile, card];
      
      const isWinner = newHand.length === 0;
      const status: GameStatus = isWinner ? (currentPlayer.isHuman ? 'won' : 'lost') : 'playing';
      const winnerId = isWinner ? currentPlayer.id : null;

      if (isWinner) {
        if (currentPlayer.isHuman) {
          playPeacefulFireworks();
          playVictorySound();
          updateStats(true);
        } else {
          updateStats(false);
        }
      }

      const nextTurnIndex = (playerIndex + 1) % prev.players.length;
      const newPlayers = prev.players.map((p, idx) => 
        idx === playerIndex ? { ...p, hand: newHand } : p
      );

      return {
        ...prev,
        discardPile: newDiscardPile,
        players: newPlayers,
        currentTurnIndex: isWinner ? playerIndex : nextTurnIndex,
        status,
        currentSuit: newSuit,
        lastAction: `${currentPlayer.name} 打出了 ${SUIT_SYMBOLS[card.suit]}${card.rank}${newSuit ? ` (变色为 ${SUIT_LABELS[newSuit]})` : ''}`,
        winnerId,
      };
    });
  };

  const handleSuitSelect = (suit: Suit) => {
    if (!pendingWildCard || !gameState) return;
    playCard(pendingWildCard, gameState.currentTurnIndex, suit);
    setPendingWildCard(null);
  };

  const handleCancelWildCard = () => {
    setPendingWildCard(null);
    setGameState(prev => ({ ...prev, status: 'playing' }));
  };

  const drawCard = (playerIndex: number) => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;
      const currentPlayer = prev.players[playerIndex];

      if (prev.deck.length === 0) {
        const nextTurnIndex = (playerIndex + 1) % prev.players.length;
        return {
          ...prev,
          currentTurnIndex: nextTurnIndex,
          lastAction: '摸牌堆已空，跳过回合。'
        };
      }

      const newDeck = [...prev.deck];
      const drawnCard = newDeck.pop()!;
      let newHand = [...currentPlayer.hand, drawnCard];
      
      if (currentPlayer.isHuman) {
        newHand = sortHand(newHand);
      }

      const newPlayers = prev.players.map((p, idx) => 
        idx === playerIndex ? { ...p, hand: newHand } : p
      );

      const nextTurnIndex = (playerIndex + 1) % prev.players.length;

      return {
        ...prev,
        deck: newDeck,
        players: newPlayers,
        lastAction: `${currentPlayer.name} 摸了一张牌。`,
        currentTurnIndex: nextTurnIndex
      };
    });
  };

  // AI Logic
  useEffect(() => {
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (gameState.status === 'playing' && currentPlayer && !currentPlayer.isHuman) {
      const timer = setTimeout(() => {
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const playableCards = currentPlayer.hand.filter(c => isValidMove(c, topCard, gameState.currentSuit));

        if (playableCards.length > 0) {
          const nonEight = playableCards.find(c => c.rank !== '8');
          const cardToPlay = nonEight || playableCards[0];
          
          if (cardToPlay.rank === '8') {
            const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
            currentPlayer.hand.forEach(c => suitCounts[c.suit]++);
            const bestSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
            playCard(cardToPlay, gameState.currentTurnIndex, bestSuit);
          } else {
            playCard(cardToPlay, gameState.currentTurnIndex);
          }
        } else {
          drawCard(gameState.currentTurnIndex);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurnIndex, gameState.status, gameState.players]);

  const topCard = gameState.discardPile.length > 0 ? gameState.discardPile[gameState.discardPile.length - 1] : null;
  const currentPlayer = gameState.players.length > 0 ? gameState.players[gameState.currentTurnIndex] : null;
  const playerHasPlayable = !!(currentPlayer?.isHuman && topCard && currentPlayer.hand.some(c => isValidMove(c, topCard, gameState.currentSuit)));
  const humanPlayer = gameState.players.find(p => p.isHuman);
  const aiPlayers = gameState.players.filter(p => !p.isHuman);

  return (
    <div className="min-h-screen bg-emerald-900 text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 p-1.5 rounded-lg shadow-lg shadow-yellow-500/20">
            <Layers className="w-6 h-6 text-emerald-900" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Bavel的疯狂8点</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState(prev => ({ ...prev, status: 'setup' }))}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="重新开始"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-8 min-h-[calc(100vh-4rem)]">
        {gameState.status !== 'setup' ? (
          <>
            {/* AI Hands */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiPlayers.map((ai) => (
                <div key={ai.id} className="flex flex-col items-center gap-2">
                  <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                    gameState.currentTurnIndex === ai.id 
                      ? 'bg-blue-500 text-white border-blue-400' 
                      : 'text-emerald-200 bg-emerald-800/50 border-emerald-700/50'
                  }`}>
                    <Cpu className="w-3 h-3" />
                    <span>{ai.name} ({ai.hand.length} 张)</span>
                  </div>
                  <div className="flex justify-center -space-x-6 md:-space-x-8">
                    {ai.hand.map((card, idx) => (
                      <Card key={card.id} card={card} isFaceUp={false} isSmall className="z-[idx]" backUrl={gameState.cardBackUrl} />
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Center Table */}
            <section className="flex-1 flex flex-col items-center justify-center gap-8 py-8">
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
                {/* Draw Pile */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-blue-500/20 blur rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <button 
                      onClick={() => currentPlayer?.isHuman && drawCard(gameState.currentTurnIndex)}
                      disabled={!currentPlayer?.isHuman || gameState.status !== 'playing' || gameState.deck.length === 0}
                      className="relative"
                    >
                      <Card 
                        card={{ id: 'back', suit: 'spades', rank: 'A' }} 
                        isFaceUp={false} 
                        backUrl={gameState.cardBackUrl}
                        className={`${currentPlayer?.isHuman && gameState.deck.length > 0 ? 'hover:ring-4 ring-yellow-400 cursor-pointer' : 'opacity-50'}`}
                      />
                      {gameState.deck.length > 0 && (
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                          {gameState.deck.length}
                        </div>
                      )}
                    </button>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">摸牌堆</span>
                </div>

                {/* Discard Pile */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <AnimatePresence mode="popLayout">
                      {topCard && (
                        <motion.div
                          key={topCard.id}
                          initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
                          animate={{ rotate: 0, scale: 1, opacity: 1 }}
                          className="relative z-10"
                        >
                          <Card card={topCard} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* Visual stack effect */}
                    {gameState.discardPile.length > 1 && (
                      <div className="absolute top-1 left-1 -z-10 w-20 h-28 md:w-24 md:h-36 bg-white/20 rounded-lg border border-white/10"></div>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">弃牌堆</span>
                    {gameState.currentSuit && (
                      <div className="mt-1 flex items-center gap-1 bg-yellow-400 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                        <span>当前花色:</span>
                        <span className="text-sm">{SUIT_SYMBOLS[gameState.currentSuit]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="bg-black/30 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm text-center max-w-md w-full">
                <p className="text-emerald-100 font-medium">
                  {currentPlayer?.isHuman && !playerHasPlayable && gameState.status === 'playing' 
                    ? '⚠️ 你没有可出的牌了，请从摸牌堆摸一张牌！' 
                    : gameState.lastAction}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${currentPlayer?.isHuman ? (playerHasPlayable ? 'bg-yellow-400' : 'bg-red-400') : 'bg-blue-400'}`}></div>
                  <span className="text-xs text-emerald-300 uppercase tracking-tighter font-bold">
                    {currentPlayer?.isHuman 
                      ? (playerHasPlayable ? '轮到你了' : '无牌可出') 
                      : `${currentPlayer?.name} 思考中...`}
                  </span>
                </div>
              </div>
            </section>

            {/* Player Hand */}
            <section className="flex flex-col items-center gap-6 pb-8">
              <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full border transition-colors ${
                currentPlayer?.isHuman 
                  ? 'bg-yellow-500 text-emerald-900 border-yellow-400' 
                  : 'text-yellow-200 bg-yellow-900/30 border-yellow-700/30'
              }`}>
                <User className="w-4 h-4" />
                <span>你的手牌 ({humanPlayer?.hand.length} 张)</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 max-w-4xl">
                {humanPlayer?.hand.map((card) => (
                  <Card 
                    key={card.id} 
                    card={card} 
                    isPlayable={currentPlayer?.isHuman && gameState.status === 'playing' && isValidMove(card, topCard, gameState.currentSuit)}
                    onClick={() => handlePlayerPlay(card)}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              {/* Left: Intro */}
              <div className="text-left space-y-6">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-emerald-900 px-4 py-2 rounded-full font-black text-sm uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  经典纸牌游戏
                </div>
                <h2 className="text-5xl md:text-6xl font-black leading-tight">
                  Bavel的<br />
                  <span className="text-yellow-400">疯狂8点</span>
                </h2>
                <div className="space-y-4 text-emerald-100/80 text-lg leading-relaxed">
                  <p>
                    疯狂8点（Crazy Eights）是一款风靡全球的策略纸牌游戏。你的目标是成为第一个清空手牌的人！
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      <span>打出与弃牌堆顶牌<strong>相同花色</strong>或<strong>相同数字</strong>的牌。</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      <span><strong>数字 8 是万能牌！</strong>它可以随时打出，并让你指定接下来的花色。</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      <span>如果没有可出的牌，必须从摸牌堆摸一张。</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Selection */}
              <div className="bg-emerald-800/40 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-2xl">
                {/* Stats Display */}
                <div className="flex justify-around mb-8 p-4 bg-black/20 rounded-2xl border border-white/5">
                  <div className="text-center">
                    <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">总局数</div>
                    <div className="text-2xl font-black">{stats.games}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">胜场</div>
                    <div className="text-2xl font-black">{stats.wins}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">败场</div>
                    <div className="text-2xl font-black">{stats.losses}</div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-6 text-center">选择玩家人数</h3>
                <div className="grid gap-4">
                  {[
                    { count: 2, color: 'hover:bg-blue-500', iconBg: 'bg-blue-400/20' },
                    { count: 3, color: 'hover:bg-purple-500', iconBg: 'bg-purple-400/20' },
                    { count: 4, color: 'hover:bg-orange-500', iconBg: 'bg-orange-400/20' }
                  ].map(({ count, color, iconBg }) => (
                    <button
                      key={count}
                      onClick={() => initGame(count)}
                      className={`group flex items-center justify-between bg-white/5 ${color} hover:text-white p-6 rounded-2xl border border-white/5 transition-all active:scale-95`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`bg-white/10 group-hover:bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl`}>
                          {count}
                        </div>
                        <span className="text-xl font-bold">{count} 人对战模式</span>
                      </div>
                      <Users className="w-6 h-6 opacity-40 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-center text-emerald-400/60 text-sm">
                  包含你自己在内的玩家总数
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Suit Selector Modal */}
      {gameState.status === 'waiting_for_suit' && (
        <SuitSelector onSelect={handleSuitSelect} onCancel={handleCancelWildCard} />
      )}

      {/* Game Over Modal */}
      {(gameState.status === 'won' || gameState.status === 'lost') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="bg-emerald-800 p-8 md:p-12 rounded-[2rem] border-2 border-white/20 shadow-2xl text-center max-w-md w-full"
          >
            <div className={`inline-flex p-4 rounded-full mb-6 ${gameState.status === 'won' ? 'bg-yellow-400 text-emerald-900' : 'bg-red-500 text-white'}`}>
              <Trophy className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight">
              {gameState.status === 'won' ? '你赢了！' : `${gameState.players.find(p => p.id === gameState.winnerId)?.name || 'AI'} 赢了`}
            </h2>
            <p className="text-emerald-200 mb-8 font-medium">
              {gameState.status === 'won' 
                ? '太棒了，你清空了所有手牌！' 
                : DEFEAT_REMARKS[Math.floor(Math.random() * DEFEAT_REMARKS.length)]}
            </p>

            {/* Stats in Modal */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">总局数</div>
                <div className="text-xl font-black">{stats.games}</div>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] text-yellow-400 font-bold uppercase">胜场</div>
                <div className="text-xl font-black">{stats.wins}</div>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] text-red-400 font-bold uppercase">败场</div>
                <div className="text-xl font-black">{stats.losses}</div>
              </div>
            </div>
            <button 
              onClick={() => setGameState(prev => ({ ...prev, status: 'setup' }))}
              className="w-full bg-white text-emerald-900 font-bold py-4 rounded-2xl hover:bg-yellow-400 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl"
            >
              <RotateCcw className="w-5 h-5" />
              再来一局
            </button>
          </motion.div>
        </div>
      )}

      <footer className="p-4 text-center text-emerald-400/50 text-[10px] uppercase tracking-widest font-bold">
        Bavel Crazy Eights &copy; 2026 • Bavel的疯狂8点
      </footer>
    </div>
  );
}
