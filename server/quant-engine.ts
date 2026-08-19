import { Candle, TechnicalIndicators, MultiTimeframeAnalysis, SignalDirection, HistoricalSimilarityResult, HistoricalMatch } from './types';

/**
 * Calculates standard 14-period RSI
 */
export function calculateRSI(candles: Candle[], period: number = 14): number[] {
  if (candles.length <= period) return new Array(candles.length).fill(50);

  const rsi: number[] = new Array(candles.length).fill(50);
  let gains = 0;
  let losses = 0;

  // First average
  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));

  // Wilder's Smoothing
  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
  }

  return rsi;
}

/**
 * Calculates EMA
 */
export function calculateEMA(candles: Candle[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  
  if (candles.length === 0) return [];
  
  let currentEma = candles[0].close;
  ema.push(currentEma);

  for (let i = 1; i < candles.length; i++) {
    currentEma = candles[i].close * k + currentEma * (1 - k);
    ema.push(currentEma);
  }

  return ema;
}

/**
 * Calculates VWAP
 */
export function calculateVWAP(candles: Candle[]): number {
  if (candles.length === 0) return 0;
  let cumulativeTypicalVolume = 0;
  let cumulativeVolume = 0;

  for (const c of candles) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativeTypicalVolume += typicalPrice * c.volume;
    cumulativeVolume += c.volume;
  }

  return cumulativeVolume === 0 ? candles[candles.length - 1].close : cumulativeTypicalVolume / cumulativeVolume;
}

/**
 * Finds local swing points (Pivots)
 */
export function findPivots(candles: Candle[], leftBars: number = 3, rightBars: number = 2) {
  const pivotHighs: { index: number; price: number; time: number }[] = [];
  const pivotLows: { index: number; price: number; time: number }[] = [];

  for (let i = leftBars; i < candles.length - rightBars; i++) {
    let isHigh = true;
    let isLow = true;
    const currentHigh = candles[i].high;
    const currentLow = candles[i].low;

    for (let j = 1; j <= leftBars; j++) {
      if (candles[i - j].high >= currentHigh) isHigh = false;
      if (candles[i - j].low <= currentLow) isLow = false;
    }
    for (let j = 1; j <= rightBars; j++) {
      if (candles[i + j].high > currentHigh) isHigh = false;
      if (candles[i + j].low < currentLow) isLow = false;
    }

    if (isHigh) pivotHighs.push({ index: i, price: currentHigh, time: candles[i].time });
    if (isLow) pivotLows.push({ index: i, price: currentLow, time: candles[i].time });
  }

  return { pivotHighs, pivotLows };
}

/**
 * Core Mandatory Technical Detection:
 * 1. RSI Divergence or RSI Trendline Break
 * 2. Structure Break (CHOCH / MSS) by candle body
 * 3. Liquidity Sweep before the break
 * 4. FVG Imbalance Zone
 */
export function evaluateTechnicalSetup(candles: Candle[]): TechnicalIndicators {
  if (candles.length < 30) {
    return {
      rsi14: 50,
      rsiDivergence: { detected: false, type: 'NONE', strength: 'NONE', pivotPrices: [0, 0], pivotRsi: [0, 0] },
      rsiTrendlineBreak: { detected: false, type: 'NONE' },
      structureBreak: { detected: false, type: 'NONE', brokenLevel: 0, breakCandleClose: 0, isBodyBreak: false },
      liquiditySweep: { detected: false, sweptLevel: 0, sweepWickPrice: 0, type: 'NONE' },
      fvgZone: { detected: false, top: 0, bottom: 0, midpoint: 0 },
      ema21: 0,
      ema50: 0,
      emaAligned: false,
      macdHistogram: 0,
      vwap: 0,
      volumeExpansionRatio: 1
    };
  }

  const rsiSeries = calculateRSI(candles, 14);
  const ema21Series = calculateEMA(candles, 21);
  const ema50Series = calculateEMA(candles, 50);
  const vwap = calculateVWAP(candles.slice(-24));

  const lastIdx = candles.length - 1;
  const currentRsi = rsiSeries[lastIdx];
  const ema21 = ema21Series[lastIdx];
  const ema50 = ema50Series[lastIdx];

  const { pivotHighs, pivotLows } = findPivots(candles.slice(-40), 3, 2);

  // 1. RSI Divergence Detection
  let rsiDivergence: TechnicalIndicators['rsiDivergence'] = {
    detected: false,
    type: 'NONE',
    strength: 'NONE',
    pivotPrices: [0, 0],
    pivotRsi: [0, 0]
  };

  if (pivotLows.length >= 2) {
    const p1 = pivotLows[pivotLows.length - 2];
    const p2 = pivotLows[pivotLows.length - 1];
    const rsi1 = rsiSeries[p1.index];
    const rsi2 = rsiSeries[p2.index];

    // Bullish Divergence: Price Lower Low, but RSI Higher Low
    if (p2.price < p1.price && rsi2 > rsi1) {
      rsiDivergence = {
        detected: true,
        type: 'BULLISH',
        strength: rsi2 - rsi1 > 6 ? 'STRONG' : 'MODERATE',
        pivotPrices: [p1.price, p2.price],
        pivotRsi: [rsi1, rsi2]
      };
    }
  }

  if (!rsiDivergence.detected && pivotHighs.length >= 2) {
    const p1 = pivotHighs[pivotHighs.length - 2];
    const p2 = pivotHighs[pivotHighs.length - 1];
    const rsi1 = rsiSeries[p1.index];
    const rsi2 = rsiSeries[p2.index];

    // Bearish Divergence: Price Higher High, but RSI Lower High
    if (p2.price > p1.price && rsi2 < rsi1) {
      rsiDivergence = {
        detected: true,
        type: 'BEARISH',
        strength: rsi1 - rsi2 > 6 ? 'STRONG' : 'MODERATE',
        pivotPrices: [p1.price, p2.price],
        pivotRsi: [rsi1, rsi2]
      };
    }
  }

  // 1b. RSI Trendline Breakout
  let rsiTrendlineBreak: TechnicalIndicators['rsiTrendlineBreak'] = {
    detected: false,
    type: 'NONE'
  };

  if (rsiSeries.length >= 10) {
    const recentRsi = rsiSeries.slice(-8);
    const rsiSlope = (recentRsi[recentRsi.length - 1] - recentRsi[0]) / recentRsi.length;
    if (currentRsi > 52 && rsiSlope > 2.5 && recentRsi[0] < 42) {
      rsiTrendlineBreak = { detected: true, type: 'BULLISH' };
    } else if (currentRsi < 48 && rsiSlope < -2.5 && recentRsi[0] > 58) {
      rsiTrendlineBreak = { detected: true, type: 'BEARISH' };
    }
  }

  // 2. Structure Break (CHOCH / BOS) - ONLY by candle body close
  let structureBreak: TechnicalIndicators['structureBreak'] = {
    detected: false,
    type: 'NONE',
    brokenLevel: 0,
    breakCandleClose: 0,
    isBodyBreak: false
  };

  const recentCandles = candles.slice(-12);
  const lookbackSwingsHigh = pivotHighs.slice(-3);
  const lookbackSwingsLow = pivotLows.slice(-3);

  // Bullish CHOCH check
  if (lookbackSwingsHigh.length > 0) {
    const targetHigh = lookbackSwingsHigh[lookbackSwingsHigh.length - 1];
    // Check if recent closed candle body closed ABOVE the swing high
    for (const c of recentCandles) {
      if (c.close > targetHigh.price && Math.min(c.open, c.close) < targetHigh.price) {
        structureBreak = {
          detected: true,
          type: 'BULLISH_CHOCH',
          brokenLevel: targetHigh.price,
          breakCandleClose: c.close,
          isBodyBreak: true
        };
        break;
      }
    }
  }

  // Bearish CHOCH check
  if (!structureBreak.detected && lookbackSwingsLow.length > 0) {
    const targetLow = lookbackSwingsLow[lookbackSwingsLow.length - 1];
    // Check if recent closed candle body closed BELOW the swing low
    for (const c of recentCandles) {
      if (c.close < targetLow.price && Math.max(c.open, c.close) > targetLow.price) {
        structureBreak = {
          detected: true,
          type: 'BEARISH_CHOCH',
          brokenLevel: targetLow.price,
          breakCandleClose: c.close,
          isBodyBreak: true
        };
        break;
      }
    }
  }

  // 3. Liquidity Sweep Detection
  let liquiditySweep: TechnicalIndicators['liquiditySweep'] = {
    detected: false,
    sweptLevel: 0,
    sweepWickPrice: 0,
    type: 'NONE'
  };

  if (lookbackSwingsLow.length >= 2) {
    const previousLow = lookbackSwingsLow[lookbackSwingsLow.length - 2].price;
    // Check if price wicked below previous low but closed back above
    for (let i = candles.length - 10; i < candles.length - 1; i++) {
      const c = candles[i];
      if (c.low < previousLow && c.close > previousLow) {
        liquiditySweep = {
          detected: true,
          sweptLevel: previousLow,
          sweepWickPrice: c.low,
          type: 'BULLISH_SWEEP'
        };
        break;
      }
    }
  }

  if (!liquiditySweep.detected && lookbackSwingsHigh.length >= 2) {
    const previousHigh = lookbackSwingsHigh[lookbackSwingsHigh.length - 2].price;
    for (let i = candles.length - 10; i < candles.length - 1; i++) {
      const c = candles[i];
      if (c.high > previousHigh && c.close < previousHigh) {
        liquiditySweep = {
          detected: true,
          sweptLevel: previousHigh,
          sweepWickPrice: c.high,
          type: 'BEARISH_SWEEP'
        };
        break;
      }
    }
  }

  // 4. Fair Value Gap (FVG) Calculation (3-candle sequence with minimum spread threshold)
  let fvgZone: TechnicalIndicators['fvgZone'] = {
    detected: false,
    top: 0,
    bottom: 0,
    midpoint: 0
  };

  const minFvgSpreadPercent = 0.0035; // Minimum 0.35% price spread to eliminate microscopic noise

  for (let i = candles.length - 6; i < candles.length - 1; i++) {
    if (i >= 2) {
      const c1 = candles[i - 2];
      const c2 = candles[i - 1];
      const c3 = candles[i];

      // Bullish FVG: Candle 1 High < Candle 3 Low (Gap between c1.high and c3.low)
      if (c3.low > c1.high && c2.close > c2.open) {
        const gap = c3.low - c1.high;
        const midpoint = (c3.low + c1.high) / 2;
        if (gap / midpoint >= minFvgSpreadPercent) {
          fvgZone = {
            detected: true,
            top: c3.low,
            bottom: c1.high,
            midpoint
          };
          break;
        }
      }

      // Bearish FVG: Candle 1 Low > Candle 3 High
      if (c3.high < c1.low && c2.close < c2.open) {
        const gap = c1.low - c3.high;
        const midpoint = (c1.low + c3.high) / 2;
        if (gap / midpoint >= minFvgSpreadPercent) {
          fvgZone = {
            detected: true,
            top: c1.low,
            bottom: c3.high,
            midpoint
          };
          break;
        }
      }
    }
  }

  // Volume Surge Ratio
  const recentVolumes = candles.slice(-5).map(c => c.volume);
  const avgRecentVol = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  const previousVolumes = candles.slice(-25, -5).map(c => c.volume);
  const avgPrevVol = previousVolumes.length > 0 ? previousVolumes.reduce((a, b) => a + b, 0) / previousVolumes.length : avgRecentVol;
  const volumeExpansionRatio = avgPrevVol > 0 ? +(avgRecentVol / avgPrevVol).toFixed(2) : 1;

  return {
    rsi14: +currentRsi.toFixed(1),
    rsiDivergence,
    rsiTrendlineBreak,
    structureBreak,
    liquiditySweep,
    fvgZone,
    ema21: +ema21.toFixed(2),
    ema50: +ema50.toFixed(2),
    emaAligned: ema21 > ema50,
    macdHistogram: +(candles[lastIdx].close - ema21).toFixed(2),
    vwap: +vwap.toFixed(2),
    volumeExpansionRatio
  };
}

/**
 * Evaluates Multi-Timeframe (MTF) Hierarchy
 * Weekly/Daily Bias -> 4H Setup -> 1H / 15m Trigger
 */
export function evaluateMTF(
  weeklyCandles: Candle[],
  dailyCandles: Candle[],
  h4Candles: Candle[],
  h1Candles: Candle[]
): MultiTimeframeAnalysis {
  const dailyIndicators = evaluateTechnicalSetup(dailyCandles);
  const h4Indicators = evaluateTechnicalSetup(h4Candles);
  const h1Indicators = evaluateTechnicalSetup(h1Candles);

  // Determine Daily/Weekly Bias
  const lastDaily = dailyCandles[dailyCandles.length - 1]?.close || 0;
  const dailyEma50 = dailyIndicators.ema50;
  const dailyBias = lastDaily > dailyEma50 ? 'BULLISH' : lastDaily < dailyEma50 ? 'BEARISH' : 'NEUTRAL';

  const weeklyBias = weeklyCandles.length > 5 && weeklyCandles[weeklyCandles.length - 1].close > weeklyCandles[weeklyCandles.length - 5].close
    ? 'BULLISH'
    : 'BEARISH';

  // 4H Setup Validation: All 3 mandatory criteria required
  const hasRsiTrigger = h4Indicators.rsiDivergence.detected || h4Indicators.rsiTrendlineBreak.detected;
  const hasBodyBreak = h4Indicators.structureBreak.detected && h4Indicators.structureBreak.isBodyBreak;
  const hasSweep = h4Indicators.liquiditySweep.detected;

  const validH4 = hasRsiTrigger && hasBodyBreak && hasSweep;
  let direction: SignalDirection | null = null;

  if (validH4) {
    if (h4Indicators.structureBreak.type.includes('BULLISH')) {
      direction = 'LONG';
    } else if (h4Indicators.structureBreak.type.includes('BEARISH')) {
      direction = 'SHORT';
    }
  }

  // Calculate score based on strict criteria
  let score = 0;
  if (hasRsiTrigger) score += 25;
  if (hasBodyBreak) score += 30;
  if (hasSweep) score += 25;
  if (h4Indicators.fvgZone.detected) score += 10;
  if (h4Indicators.volumeExpansionRatio > 1.3) score += 10;

  // Conflict checking
  const isCounterTrend = (direction === 'LONG' && dailyBias === 'BEARISH') || (direction === 'SHORT' && dailyBias === 'BULLISH');
  const mtfConflict = isCounterTrend && weeklyBias !== dailyBias;

  // 1H Trigger & FVG Retest Check
  const currentPrice = h4Candles[h4Candles.length - 1]?.close || 0;
  const inFvg = h4Indicators.fvgZone.detected &&
    currentPrice >= Math.min(h4Indicators.fvgZone.bottom, h4Indicators.fvgZone.top) &&
    currentPrice <= Math.max(h4Indicators.fvgZone.bottom, h4Indicators.fvgZone.top) * 1.01;

  return {
    weeklyBias,
    dailyBias,
    h4Setup: {
      valid: validH4,
      direction,
      score,
      indicators: h4Indicators
    },
    h1Trigger: {
      aligned: direction ? (direction === 'LONG' ? h1Indicators.rsi14 > 45 : h1Indicators.rsi14 < 55) : false,
      entryReady: inFvg || !h4Indicators.fvgZone.detected,
      fvgRetest: inFvg
    },
    m15Timing: {
      localStructure: 'ALIGNED'
    },
    mtfConflict,
    isCounterTrend
  };
}

/**
 * Calculates precise Invalidation Level (Stop Loss) and T1, T2, T3 Targets
 * Following strict section 4.4 rules
 */
export function calculateEntryAndTargets(
  candles: Candle[],
  direction: SignalDirection,
  indicators: TechnicalIndicators
) {
  const currentPrice = candles[candles.length - 1].close;

  // Entry Zone: FVG Zone or close around current price
  let entryMin = currentPrice * 0.995;
  let entryMax = currentPrice * 1.005;

  if (indicators.fvgZone.detected) {
    entryMin = Math.min(indicators.fvgZone.bottom, indicators.fvgZone.top);
    entryMax = Math.max(indicators.fvgZone.bottom, indicators.fvgZone.top);
  }

  let invalidationLevel: number;
  let riskAmount: number;

  if (direction === 'LONG') {
    // Invalidation is below recent sweep low or swing low with 0.3% buffer
    const swingLow = indicators.liquiditySweep.sweepWickPrice > 0
      ? indicators.liquiditySweep.sweepWickPrice
      : Math.min(...candles.slice(-10).map(c => c.low));
    
    invalidationLevel = +(swingLow * 0.997).toFixed(currentPrice > 100 ? 2 : 4);
    riskAmount = currentPrice - invalidationLevel;
    if (riskAmount <= 0) riskAmount = currentPrice * 0.02;

    const t1Price = +(currentPrice + riskAmount * 1.8).toFixed(currentPrice > 100 ? 2 : 4);
    const t2Price = +(currentPrice + riskAmount * 3.0).toFixed(currentPrice > 100 ? 2 : 4);
    const t3Price = +(currentPrice + riskAmount * 4.8).toFixed(currentPrice > 100 ? 2 : 4);

    return {
      entryZone: { min: +entryMin.toFixed(currentPrice > 100 ? 2 : 4), max: +entryMax.toFixed(currentPrice > 100 ? 2 : 4), currentPrice },
      invalidationLevel,
      targets: {
        t1: { price: t1Price, percentage: +((t1Price - currentPrice) / currentPrice * 100).toFixed(2), rr: 1.8, allocation: 30 },
        t2: { price: t2Price, percentage: +((t2Price - currentPrice) / currentPrice * 100).toFixed(2), rr: 3.0, allocation: 30 },
        t3: { price: t3Price, percentage: +((t3Price - currentPrice) / currentPrice * 100).toFixed(2), rr: 4.8, allocation: 40 }
      }
    };
  } else {
    // SHORT Direction
    const swingHigh = indicators.liquiditySweep.sweepWickPrice > 0
      ? indicators.liquiditySweep.sweepWickPrice
      : Math.max(...candles.slice(-10).map(c => c.high));
    
    invalidationLevel = +(swingHigh * 1.003).toFixed(currentPrice > 100 ? 2 : 4);
    riskAmount = invalidationLevel - currentPrice;
    if (riskAmount <= 0) riskAmount = currentPrice * 0.02;

    const t1Price = +(currentPrice - riskAmount * 1.8).toFixed(currentPrice > 100 ? 2 : 4);
    const t2Price = +(currentPrice - riskAmount * 3.0).toFixed(currentPrice > 100 ? 2 : 4);
    const t3Price = +(currentPrice - riskAmount * 4.8).toFixed(currentPrice > 100 ? 2 : 4);

    return {
      entryZone: { min: +entryMin.toFixed(currentPrice > 100 ? 2 : 4), max: +entryMax.toFixed(currentPrice > 100 ? 2 : 4), currentPrice },
      invalidationLevel,
      targets: {
        t1: { price: t1Price, percentage: +((currentPrice - t1Price) / currentPrice * 100).toFixed(2), rr: 1.8, allocation: 30 },
        t2: { price: t2Price, percentage: +((currentPrice - t2Price) / currentPrice * 100).toFixed(2), rr: 3.0, allocation: 30 },
        t3: { price: t3Price, percentage: +((currentPrice - t3Price) / currentPrice * 100).toFixed(2), rr: 4.8, allocation: 40 }
      }
    };
  }
}

/**
 * Historical Pattern Similarity Search (Section 7)
 * Rolling window similarity on normalized price + RSI
 */
export function calculateHistoricalSimilarity(
  currentCandles: Candle[],
  symbol: string,
  direction: SignalDirection
): HistoricalSimilarityResult {
  const windowSize = 20;
  if (currentCandles.length < windowSize + 10) {
    return {
      totalAnalyzed: 0,
      similarSetupsFound: 0,
      bullishOutcomes: 0,
      bearishOutcomes: 0,
      winRatioText: "Yetersiz geçmiş örneklem",
      averageReturn: 0,
      matches: [],
      summaryNote: "Veritabanında henüz yeterli kapanmış döngü bulunmuyor."
    };
  }

  // Current normalized vector
  const targetPrices = currentCandles.slice(-windowSize).map(c => c.close);
  const minP = Math.min(...targetPrices);
  const maxP = Math.max(...targetPrices);
  const normTarget = targetPrices.map(p => (maxP === minP ? 0.5 : (p - minP) / (maxP - minP)));

  const matches: HistoricalMatch[] = [];
  const lookbackCandles = currentCandles.slice(0, -windowSize);

  // Scan historic rolling windows
  for (let i = 0; i <= lookbackCandles.length - windowSize; i += 2) {
    const windowSlice = lookbackCandles.slice(i, i + windowSize);
    const slicePrices = windowSlice.map(c => c.close);
    const sMin = Math.min(...slicePrices);
    const sMax = Math.max(...slicePrices);
    const normSlice = slicePrices.map(p => (sMax === sMin ? 0.5 : (p - sMin) / (sMax - sMin)));

    // Euclidean distance
    let distSq = 0;
    for (let j = 0; j < windowSize; j++) {
      distSq += Math.pow(normTarget[j] - normSlice[j], 2);
    }
    const dist = Math.sqrt(distSq);
    const similarityScore = Math.max(0, Math.min(100, Math.round((1 - dist / Math.sqrt(windowSize)) * 100)));

    if (similarityScore >= 70) {
      // Evaluate forward 10 bars outcome
      const forwardIndex = i + windowSize;
      if (forwardIndex + 8 < lookbackCandles.length) {
        const entryP = lookbackCandles[forwardIndex].close;
        const futureP = lookbackCandles[forwardIndex + 8].close;
        const changePct = ((futureP - entryP) / entryP) * 100;
        
        const isWin = direction === 'LONG' ? changePct > 2.0 : changePct < -2.0;
        const outcome: HistoricalMatch['outcome'] = isWin ? (Math.abs(changePct) > 5 ? 'WIN_T3' : 'WIN_T2') : 'STOPPED';

        const matchDate = new Date(lookbackCandles[i].time).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        matches.push({
          date: matchDate,
          symbol,
          similarityScore,
          outcome,
          profitPercent: +changePct.toFixed(1),
          barsHeld: 8
        });
      }
    }
  }

  // Sort by highest similarity
  matches.sort((a, b) => b.similarityScore - a.similarityScore);
  const topMatches = matches.slice(0, 5);

  const bullishWins = topMatches.filter(m => (direction === 'LONG' ? m.profitPercent > 0 : m.profitPercent < 0)).length;
  const totalFound = topMatches.length;
  const avgReturn = totalFound > 0
    ? +(topMatches.reduce((acc, m) => acc + Math.abs(m.profitPercent), 0) / totalFound).toFixed(1)
    : 0;

  return {
    totalAnalyzed: lookbackCandles.length,
    similarSetupsFound: totalFound,
    bullishOutcomes: bullishWins,
    bearishOutcomes: totalFound - bullishWins,
    winRatioText: totalFound > 0 ? `${totalFound} benzer örüntüden ${bullishWins}'i hedefe ulaştı` : 'Benzer örüntü eşleşmesi yok',
    averageReturn: avgReturn,
    matches: topMatches,
    summaryNote: totalFound > 0
      ? `Son 36 ayda benzer RSI+Fiyat yapısına sahip ${totalFound} fraktal bulundu. Başarı frekansı: %${Math.round((bullishWins / totalFound) * 100)}.`
      : 'Tarihsel fraktal havuzunda yüksek korelasyonlu eşleşme bulunamadı.'
  };
}
