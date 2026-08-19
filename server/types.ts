export type AssetType = 'crypto' | 'us_stock' | 'bist' | 'commodity';

export type SignalDirection = 'LONG' | 'SHORT';

export type SignalStatus = 'PENDING' | 'ACTIVE' | 'HIT_T1' | 'HIT_T2' | 'HIT_T3' | 'INVALIDATED' | 'CLOSED';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi14: number;
  rsiDivergence: {
    detected: boolean;
    type: 'BULLISH' | 'BEARISH' | 'NONE';
    strength: 'STRONG' | 'MODERATE' | 'NONE';
    pivotPrices: [number, number];
    pivotRsi: [number, number];
  };
  rsiTrendlineBreak: {
    detected: boolean;
    type: 'BULLISH' | 'BEARISH' | 'NONE';
  };
  structureBreak: {
    detected: boolean;
    type: 'BULLISH_CHOCH' | 'BEARISH_CHOCH' | 'BULLISH_BOS' | 'BEARISH_BOS' | 'NONE';
    brokenLevel: number;
    breakCandleClose: number;
    isBodyBreak: boolean;
  };
  liquiditySweep: {
    detected: boolean;
    sweptLevel: number;
    sweepWickPrice: number;
    type: 'BULLISH_SWEEP' | 'BEARISH_SWEEP' | 'NONE';
  };
  fvgZone: {
    detected: boolean;
    top: number;
    bottom: number;
    midpoint: number;
  };
  ema21: number;
  ema50: number;
  emaAligned: boolean;
  macdHistogram: number;
  vwap: number;
  volumeExpansionRatio: number;
}

export interface MultiTimeframeAnalysis {
  weeklyBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  dailyBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  h4Setup: {
    valid: boolean;
    direction: SignalDirection | null;
    score: number;
    indicators: TechnicalIndicators;
  };
  h1Trigger: {
    aligned: boolean;
    entryReady: boolean;
    fvgRetest: boolean;
  };
  m15Timing: {
    localStructure: 'ALIGNED' | 'CONFLICT' | 'NEUTRAL';
  };
  mtfConflict: boolean;
  isCounterTrend: boolean;
}

export interface HistoricalMatch {
  date: string;
  symbol: string;
  similarityScore: number; // 0 - 100
  outcome: 'WIN_T2' | 'WIN_T3' | 'STOPPED' | 'BREAKEVEN';
  profitPercent: number;
  barsHeld: number;
}

export interface HistoricalSimilarityResult {
  totalAnalyzed: number;
  similarSetupsFound: number;
  bullishOutcomes: number;
  bearishOutcomes: number;
  winRatioText: string;
  averageReturn: number;
  matches: HistoricalMatch[];
  summaryNote: string;
}

export interface QuantProof {
  rsiDivergenceProof: {
    pivot1: { price: number; rsi: number; timeStr: string };
    pivot2: { price: number; rsi: number; timeStr: string };
    rsiDelta: number;
    divergenceType: string;
  };
  structureBreakProof: {
    brokenSwingLevel: number;
    breakCandleClose: number;
    breakCandleTimeStr: string;
    penetrationPercent: number;
    isBodyClose: boolean;
  };
  liquiditySweepProof: {
    sweptLevel: number;
    wickPrice: number;
    candleClose: number;
    sweepCandleTimeStr: string;
    sweepDelta: number;
  };
  fvgZoneProof: {
    candle1High: number;
    candle3Low: number;
    fvgTop: number;
    fvgBottom: number;
    gapSpreadPercent: number;
    entryRange: [number, number];
  };
  mtfProof: {
    weeklyTrend: string;
    dailyTrend: string;
    h4Trend: string;
    h1TriggerState: string;
  };
  lastClosedCandleTime: string;
}

export interface MacroSnapshot {
  timestamp: number;
  dxy: { value: number; change24h: number; trend: 'BULLISH' | 'BEARISH' | 'RANGE'; source: string };
  usdtD: { value: number; change24h: number; trend: 'BULLISH' | 'BEARISH' | 'RANGE'; source: string };
  btcD: { value: number; change24h: number; trend: 'BULLISH' | 'BEARISH' | 'RANGE'; source: string };
  vix: { value: number; change24h: number; status: 'ELEVATED' | 'NORMAL' | 'LOW'; source: string };
  us10y: { value: number; change24h: number; trend: 'RISING' | 'FALLING' | 'STABLE'; source: string };
  lastUpdatedIso: string;
  summaryEvaluation: string;
}

export interface FundamentalVetoResult {
  vetoed: boolean;
  reason?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventsFound: string[];
  suggestedSizeAdjustment: number; // 1.0 = normal, 0.5 = half size, 0.0 = veto
}

export interface SocialIntelligenceItem {
  id: string;
  analyst: string;
  handle: string;
  avatar: string;
  trackRecordScore: number; // 0 - 100
  threeMonthWinRate: number; // e.g. 74%
  recommendedAsset: string;
  direction: SignalDirection;
  targetPrice: number;
  timestamp: string;
  postSnippet: string;
  systemEvaluated: boolean;
  systemVerdict: 'APPROVED_QUALIFIED' | 'REJECTED_CRITERIA_UNMET' | 'UNDER_REVIEW';
  verdictNote: string;
}

export interface SignalOpportunity {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  direction: SignalDirection;
  entryZone: {
    min: number;
    max: number;
    currentPrice: number;
  };
  invalidationLevel: number; // SL
  targets: {
    t1: { price: number; percentage: number; rr: number; allocation: number };
    t2: { price: number; percentage: number; rr: number; allocation: number };
    t3: { price: number; percentage: number; rr: number; allocation: number };
  };
  overallScore: number; // 0 - 100
  confidenceLabel: 'YÜKSEK KALİTE (A+)' | 'STANDART KURULUM (A)' | 'DİKKATLİ / KARŞI TREND (B)';
  clusterThemeId?: string;
  relativeStrengthRank?: number;
  
  // Criteria audit
  mandatoryCriteriaMet: {
    rsiDivergenceOrTrendbreak: boolean;
    bodyStructureBreak: boolean;
    liquiditySweep: boolean;
    fvgZoneConfirmed: boolean;
    mtfHierarchyAligned: boolean;
  };
  
  // Sub-agent outputs
  quantDetails: {
    h4Rsi: number;
    divergenceType: string;
    sweepLevel: number;
    chochLevel: number;
    fvgRange: [number, number];
    volumeSurgeRatio: number;
    ema21: number;
    ema50: number;
  };
  macroConfirmation: {
    confirmed: boolean;
    note: string;
    warningFlag: boolean;
  };
  fundamentalVeto: FundamentalVetoResult;
  historicalSimilarity: HistoricalSimilarityResult;
  
  // Executive briefing
  executiveSummaryTr: string;
  orchestratorSynthesis: string;
  quantProof?: QuantProof;
  
  createdAt: number;
  closedAt?: number;
  status: SignalStatus;
  currentReturn?: number;
}

export interface AssetCluster {
  id: string;
  themeName: string;
  description: string;
  assetType: AssetType;
  averageCorrelation: number;
  leaderAsset: string;
  leaderScore: number;
  topOpportunities: SignalOpportunity[];
  weakerCorrelatedSymbols: { symbol: string; reason: string; score: number }[];
}

export interface EliminatedAssetRecord {
  symbol: string;
  name: string;
  assetType: AssetType;
  stage: 'VOLUME_THRESHOLD' | 'MTF_MISMATCH' | 'MANDATORY_CRITERIA_UNMET' | 'FUNDAMENTAL_VETO';
  stageTitle: string;
  exactReason: string;
  metrics: {
    rsi?: number;
    volumeSurge?: number;
    structureBroken?: boolean;
    sweepDetected?: boolean;
  };
}

export interface FunnelStatistics {
  totalAssetsScreened: number;
  droppedAtVolumeThreshold: number;
  droppedAtMtfMismatch: number;
  droppedAtMissingMandatoryCriteria: number;
  droppedAtFundamentalVeto: number;
  qualifiedOpportunitiesCount: number;
  clusteredThemesCount: number;
  eliminatedAssets?: EliminatedAssetRecord[];
}

export interface TrackedPerformance {
  totalHistoricalSignals: number;
  activeSignalsCount: number;
  closedSignalsCount: number;
  winCount: number;
  lossCount: number;
  actualWinRatePercent: number;
  profitFactor: number;
  averageRiskReward: number;
  averageHoldDurationHours: number;
  assetTypeBreakdown: {
    crypto: { count: number; winRate: number };
    us_stock: { count: number; winRate: number };
    bist: { count: number; winRate: number };
    commodity: { count: number; winRate: number };
  };
}

export interface ScanStreamEvent {
  stepId: string;
  agentName: string;
  agentRole: string;
  status: 'START' | 'PROGRESS' | 'DATA' | 'VETO' | 'SUCCESS' | 'COMPLETE' | 'ERROR';
  message: string;
  timestamp: string;
  dataPayload?: any;
}
