import { getSignalsStore, saveSignals } from './signal-db';
import { fetchLiveTicker24h } from './market-data';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey', 'ripHistorical']
});

let isTracking = false;

/**
 * Background Signal Lifecycle Tracker (Master Spec Section 9)
 * Periodically monitors open signals against live market prices and transitions statuses:
 * ACTIVE -> HIT_T1 | HIT_T2 | HIT_T3 | INVALIDATED
 */
export async function runSignalLifecycleCheck() {
  if (isTracking) return;
  isTracking = true;

  try {
    const allSignals = getSignalsStore();
    const activeSignals = allSignals.filter(s => s.status === 'ACTIVE');

    if (activeSignals.length === 0) {
      isTracking = false;
      return;
    }

    const updatedSignals = [...allSignals];
    let hasChanges = false;

    for (const signal of activeSignals) {
      let currentPrice: number | null = null;

      // 1. Fetch live price based on asset type
      if (signal.assetType === 'crypto') {
        const ticker = await fetchLiveTicker24h(signal.symbol);
        if (ticker) currentPrice = ticker.lastPrice;
      } else {
        try {
          let yahooSym = signal.symbol;
          if (signal.assetType === 'bist' && !yahooSym.endsWith('.IS')) {
            yahooSym = `${yahooSym}.IS`;
          } else if (signal.assetType === 'commodity') {
            if (yahooSym === 'XAUUSD') yahooSym = 'GC=F';
            else if (yahooSym === 'XAGUSD') yahooSym = 'SI=F';
            else if (yahooSym === 'BRENT') yahooSym = 'BZ=F';
          }
          const quote: any = await yahooFinance.quote(yahooSym);
          if (quote && quote.regularMarketPrice) {
            currentPrice = quote.regularMarketPrice;
          }
        } catch {
          // Ignore quote error for single tick
        }
      }

      if (!currentPrice || currentPrice <= 0) continue;

      const entryPrice = signal.entryZone.currentPrice;
      const isLong = signal.direction === 'LONG';
      const changePct = isLong
        ? +(((currentPrice - entryPrice) / entryPrice) * 100).toFixed(2)
        : +(((entryPrice - currentPrice) / entryPrice) * 100).toFixed(2);

      signal.currentReturn = changePct;

      // 2. Check Target Hits & Invalidation Levels
      if (isLong) {
        if (currentPrice <= signal.invalidationLevel) {
          signal.status = 'INVALIDATED';
          signal.closedAt = Date.now();
          hasChanges = true;
          console.log(`[Signal Tracker] 🛑 ${signal.symbol} LONG Stop-Loss Vuruldu (${currentPrice} <= ${signal.invalidationLevel})`);
        } else if (currentPrice >= signal.targets.t3.price) {
          signal.status = 'HIT_T3';
          signal.closedAt = Date.now();
          hasChanges = true;
          console.log(`[Signal Tracker] 🏆 ${signal.symbol} LONG T3 Hedef Vuruldu (${currentPrice} >= ${signal.targets.t3.price})`);
        } else if (currentPrice >= signal.targets.t2.price && signal.status === 'ACTIVE') {
          signal.status = 'HIT_T2';
          signal.closedAt = Date.now();
          hasChanges = true;
          console.log(`[Signal Tracker] 🎯 ${signal.symbol} LONG T2 Hedef Vuruldu (${currentPrice} >= ${signal.targets.t2.price})`);
        } else if (currentPrice >= signal.targets.t1.price && signal.status === 'ACTIVE') {
          signal.status = 'HIT_T1';
          signal.closedAt = Date.now();
          hasChanges = true;
          console.log(`[Signal Tracker] 🎯 ${signal.symbol} LONG T1 Hedef Vuruldu (${currentPrice} >= ${signal.targets.t1.price})`);
        }
      } else {
        // SHORT
        if (currentPrice >= signal.invalidationLevel) {
          signal.status = 'INVALIDATED';
          signal.closedAt = Date.now();
          hasChanges = true;
          console.log(`[Signal Tracker] 🛑 ${signal.symbol} SHORT Stop-Loss Vuruldu (${currentPrice} >= ${signal.invalidationLevel})`);
        } else if (currentPrice <= signal.targets.t3.price) {
          signal.status = 'HIT_T3';
          signal.closedAt = Date.now();
          hasChanges = true;
          console.log(`[Signal Tracker] 🏆 ${signal.symbol} SHORT T3 Hedef Vuruldu (${currentPrice} <= ${signal.targets.t3.price})`);
        } else if (currentPrice <= signal.targets.t2.price && signal.status === 'ACTIVE') {
          signal.status = 'HIT_T2';
          signal.closedAt = Date.now();
          hasChanges = true;
          console.log(`[Signal Tracker] 🎯 ${signal.symbol} SHORT T2 Hedef Vuruldu (${currentPrice} <= ${signal.targets.t2.price})`);
        } else if (currentPrice <= signal.targets.t1.price && signal.status === 'ACTIVE') {
          signal.status = 'HIT_T1';
          signal.closedAt = Date.now();
          hasChanges = true;
          console.log(`[Signal Tracker] 🎯 ${signal.symbol} SHORT T1 Hedef Vuruldu (${currentPrice} <= ${signal.targets.t1.price})`);
        }
      }
    }

    if (hasChanges) {
      saveSignals(updatedSignals);
    }
  } catch (err) {
    console.error('[Signal Tracker] Error during lifecycle check:', err);
  } finally {
    isTracking = false;
  }
}

/**
 * Initializes continuous background tracking every 45 seconds
 */
export function startSignalTracker() {
  console.log('⚡ [Signal Tracker] Background lifecycle price monitor initialized.');
  // Run first check after 10s
  setTimeout(runSignalLifecycleCheck, 10000);
  // Schedule every 45s
  setInterval(runSignalLifecycleCheck, 45000);
}
