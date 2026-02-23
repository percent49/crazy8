import { Suit, Rank, CardData } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SUIT_LABELS: Record<Suit, string> = {
  hearts: '红心',
  diamonds: '方块',
  clubs: '梅花',
  spades: '黑桃',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-slate-900',
  spades: 'text-slate-900',
};

export const createDeck = (): CardData[] => {
  const deck: CardData[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
      });
    });
  });
  return deck;
};

export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const FAMOUS_NAMES = [
  '爱因斯坦', '牛顿', '达芬奇', '居里夫人', '特斯拉', 
  '莎士比亚', '贝多芬', '莫扎特', '梵高', '毕加索',
  '苏格拉底', '柏拉图', '亚里士多德', '孔子', '老子',
  '李白', '杜甫', '苏轼', '鲁迅', '张爱玲',
  '乔布斯', '马斯克', '比尔盖茨', '扎克伯格', '图灵',
  '奥黛丽赫本', '玛丽莲梦露', '卓别林', '李小龙', '成龙'
];

export const STARCRAFT_UNITS = [
  { name: '人族机枪兵 (Marine)', url: 'https://picsum.photos/seed/starcraft-marine-classic/400/600' },
  { name: '神族龙骑兵 (Dragoon)', url: 'https://picsum.photos/seed/starcraft-dragoon-classic/400/600' },
  { name: '虫族刺蛇 (Hydralisk)', url: 'https://picsum.photos/seed/starcraft-hydralisk-classic/400/600' }
];
