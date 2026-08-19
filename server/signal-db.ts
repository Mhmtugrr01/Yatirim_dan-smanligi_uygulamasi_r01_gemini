import { SignalOpportunity, TrackedPerformance, FunnelStatistics } from './types';
import fs from 'fs';
import path from 'path';

// Persistent in-memory signal store (synced with JSON file)
let signalsStore: SignalOpportunity[] = [];
let lastFunnelStats: FunnelStatistics = {
  totalAssetsScreened: 35,
  droppedAtVolumeThreshold: 0,
  droppedAtMtfMismatch: 0,
  droppedAtMissingMandatoryCriteria: 0,
  droppedAtFundamentalVeto: 0,
  qualifiedOpportunitiesCount: 0,
  clusteredThemesCount: 0
};

// Simple JSON File DB Setup (Avoids GLIBC native module errors with sqlite3)
const dbPath = path.resolve(process.cwd(), 'olympus_signals.json');

try {
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf8');
    signalsStore = JSON.parse(data);
  } else {
    fs.writeFileSync(dbPath, JSON.stringify([]));
  }
} catch (error) {
  console.error('[Signal DB] Load Error:', error);
}

function flushToDisk() {
  fs.writeFile(dbPath, JSON.stringify(signalsStore, null, 2), (err) => {
    if (err) console.error('[Signal DB] Write Error:', err);
  });
}

export function getSignalsStore(): SignalOpportunity[] {
  return signalsStore;
}

export function saveSignals(newSignals: SignalOpportunity[]) {
  for (const s of newSignals) {
    const existingIdx = signalsStore.findIndex(item => item.id === s.id || (item.symbol === s.symbol && item.status === 'ACTIVE'));
    if (existingIdx >= 0) {
      signalsStore[existingIdx] = s;
    } else {
      signalsStore.unshift(s);
    }
  }
  
  // Save to Disk
  flushToDisk();
}

export function updateFunnelStats(stats: FunnelStatistics) {
  lastFunnelStats = stats;
}

export function getFunnelStats(): FunnelStatistics {
  return lastFunnelStats;
}

/**
 * Calculates authentic tracked performance metrics (Section 9)
 * Strictly calculates from real closed records, zero fake guarantees
 */
export function getPerformanceMetrics(): TrackedPerformance {
  const all = signalsStore;
  const activeCount = all.filter(s => s.status === 'ACTIVE').length;
  const closed = all.filter(s => s.status !== 'ACTIVE' && s.status !== 'PENDING');

  const wins = closed.filter(s => s.status === 'HIT_T1' || s.status === 'HIT_T2' || s.status === 'HIT_T3').length;
  const losses = closed.filter(s => s.status === 'INVALIDATED').length;
  const totalClosed = closed.length;

  const actualWinRate = totalClosed > 0 ? +((wins / totalClosed) * 100).toFixed(1) : 0;

  // Asset type breakdowns
  function getSubStat(type: SignalOpportunity['assetType']) {
    const subset = closed.filter(s => s.assetType === type);
    const subWins = subset.filter(s => s.status === 'HIT_T1' || s.status === 'HIT_T2' || s.status === 'HIT_T3').length;
    return {
      count: subset.length,
      winRate: subset.length > 0 ? +((subWins / subset.length) * 100).toFixed(1) : 0
    };
  }

  // Calculate real average risk/reward and profit factor based on closed trades
  let totalProfitR = 0;
  let totalLossR = 0;

  for (const s of closed) {
    if (s.status === 'HIT_T1') totalProfitR += s.targets.t1.rr;
    else if (s.status === 'HIT_T2') totalProfitR += s.targets.t2.rr;
    else if (s.status === 'HIT_T3') totalProfitR += s.targets.t3.rr;
    else if (s.status === 'INVALIDATED') totalLossR += 1;
  }

  const avgRR = wins > 0 ? +(totalProfitR / wins).toFixed(2) : 0;
  const realProfitFactor = totalLossR > 0 ? +(totalProfitR / totalLossR).toFixed(2) : (wins > 0 ? 99.9 : 0);

  return {
    totalHistoricalSignals: all.length,
    activeSignalsCount: activeCount,
    closedSignalsCount: totalClosed,
    winCount: wins,
    lossCount: losses,
    actualWinRatePercent: actualWinRate,
    profitFactor: realProfitFactor,
    averageRiskReward: avgRR,
    averageHoldDurationHours: 0, // Real duration tracking requires entry/exit timestamps
    assetTypeBreakdown: {
      crypto: getSubStat('crypto'),
      us_stock: getSubStat('us_stock'),
      bist: getSubStat('bist'),
      commodity: getSubStat('commodity')
    }
  };
}
