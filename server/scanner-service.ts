import { Response } from 'express';
import { ASSET_UNIVERSE, getMacroSnapshot, resolveAssetType } from './market-data';
import { analyzeAssetOrchestrated } from './agents/orchestrator';
import { clusterAndRankOpportunities } from './agents/cluster-engine';
import { saveSignals, updateFunnelStats, getSignalsStore, getFunnelStats } from './signal-db';
import { SignalOpportunity, AssetCluster, ScanStreamEvent, FunnelStatistics } from './types';
import { sendTelegramNotification } from './telegram';

// Concurrency Lock (Section 8.3)
let isScanning = false;
let lastScanTime = 0;
let lastOpportunities: SignalOpportunity[] = [];
let lastClusters: AssetCluster[] = [];

// Active SSE client listeners
const sseListeners: Set<Response> = new Set();

export function registerSSEClient(res: Response) {
  sseListeners.add(res);
  res.on('close', () => {
    sseListeners.delete(res);
  });
}

export function broadcastScanEvent(event: ScanStreamEvent) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseListeners) {
    try {
      client.write(payload);
    } catch {
      sseListeners.delete(client);
    }
  }
}

/**
 * Main Full-Universe Scanning Pipeline
 * Adheres to Section 8 (Sequential processing, memory safety, concurrency lock, macro single-fetch)
 */
export async function executeFullScan(forceRefresh: boolean = false): Promise<{
  success: boolean;
  message: string;
  opportunities?: SignalOpportunity[];
  clusters?: AssetCluster[];
  funnelStats?: FunnelStatistics;
}> {
  // Concurrency Lock Check (Section 8.3)
  if (isScanning) {
    return {
      success: false,
      message: 'Sistem meşgul: Zaten aktif bir piyasa taraması yürütülüyor. Lütfen mevcut taramanın tamamlanmasını bekleyin.'
    };
  }

  isScanning = true;
  const startTime = Date.now();

  broadcastScanEvent({
    stepId: 'init',
    agentName: 'Orchestrator (CEO Ajanı)',
    agentRole: 'Sistem Başlatıcı & Koordinatör',
    status: 'START',
    message: 'OLYMPUS Çok Ajanlı Tarama Motoru Başlatıldı. Eşzamanlılık kilidi devrede.',
    timestamp: new Date().toLocaleTimeString('tr-TR')
  });

  const opportunities: SignalOpportunity[] = [];
  const funnelStats: FunnelStatistics = {
    totalAssetsScreened: ASSET_UNIVERSE.length,
    droppedAtVolumeThreshold: 0,
    droppedAtMtfMismatch: 0,
    droppedAtMissingMandatoryCriteria: 0,
    droppedAtFundamentalVeto: 0,
    qualifiedOpportunitiesCount: 0,
    clusteredThemesCount: 0,
    eliminatedAssets: []
  };

  try {
    // Stage 1: Macro Cross-Market Agent (Single fetch cached - Section 8.2)
    broadcastScanEvent({
      stepId: 'macro',
      agentName: 'Makro / Çapraz Piyasa Ajanı',
      agentRole: 'Global Likidite & Risk Radar',
      status: 'PROGRESS',
      message: 'Makro göstergeler (DXY, USDT.D, BTC.D, VIX, US10Y) tekil önbelleğe çekiliyor...',
      timestamp: new Date().toLocaleTimeString('tr-TR')
    });

    const macro = await getMacroSnapshot(forceRefresh);

    broadcastScanEvent({
      stepId: 'macro-done',
      agentName: 'Makro / Çapraz Piyasa Ajanı',
      agentRole: 'Global Likidite & Risk Radar',
      status: 'DATA',
      message: `Makro radar tamamlandı: DXY (${macro.dxy.value}, %${macro.dxy.change24h}), USDT.D (%${macro.usdtD.value}), VIX (${macro.vix.value}). ${macro.summaryEvaluation}`,
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      dataPayload: macro
    });

    // Stage 2: Sequential Memory-Safe Asset Processing (Section 8.1)
    let processedCount = 0;

    for (const asset of ASSET_UNIVERSE) {
      processedCount++;

      broadcastScanEvent({
        stepId: `asset-${asset.symbol}`,
        agentName: 'Teknik / Quant Ajanı',
        agentRole: 'Deterministik SMC Hesaplayıcı',
        status: 'PROGRESS',
        message: `[${processedCount}/${ASSET_UNIVERSE.length}] ${asset.name} (${asset.symbol}) çoklu zaman dilimi (1W/1D/4H/1H) verisi taranıyor...`,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      });

      // Execute unified orchestrated calculation pipeline
      const result = await analyzeAssetOrchestrated(asset);

      if (result.passed && result.opportunity) {
        opportunities.push(result.opportunity);
        funnelStats.qualifiedOpportunitiesCount++;
        
        // Push notification asynchronously without awaiting
        sendTelegramNotification(result.opportunity);

        broadcastScanEvent({
          stepId: `asset-qualified-${asset.symbol}`,
          agentName: 'Orchestrator (CEO Ajanı)',
          agentRole: 'Sinyal Onaylayıcı',
          status: 'SUCCESS',
          message: `🎯 A+ KURULUM ONAYLANDI: ${asset.symbol} 4H CHOCH + Likidite Sweep + FVG doğrulaması geçti. Skor: %${result.opportunity.overallScore}`,
          timestamp: new Date().toLocaleTimeString('tr-TR'),
          dataPayload: result.opportunity
        });
      } else {
        const stage = result.stageDropped === 'VOLUME' 
          ? 'VOLUME_THRESHOLD' 
          : result.stageDropped === 'MTF_MISMATCH' 
          ? 'MTF_MISMATCH' 
          : result.stageDropped === 'FUNDAMENTAL_VETO' 
          ? 'FUNDAMENTAL_VETO' 
          : 'MANDATORY_CRITERIA_UNMET';
          
        const stageTitle = result.stageDropped === 'VOLUME' 
          ? 'Likidite / Hacim Eşiği Altında' 
          : result.stageDropped === 'MTF_MISMATCH' 
          ? 'Çoklu Zaman Dilimi Çelişkisi' 
          : result.stageDropped === 'FUNDAMENTAL_VETO' 
          ? 'Temel Analiz / Haber Vetosu' 
          : 'SMC Zorunlu Kriterleri Karşılanmadı';

        if (result.stageDropped === 'VOLUME') funnelStats.droppedAtVolumeThreshold++;
        else if (result.stageDropped === 'MTF_MISMATCH') funnelStats.droppedAtMtfMismatch++;
        else if (result.stageDropped === 'MANDATORY_CRITERIA') funnelStats.droppedAtMissingMandatoryCriteria++;
        else if (result.stageDropped === 'FUNDAMENTAL_VETO') funnelStats.droppedAtFundamentalVeto++;

        funnelStats.eliminatedAssets?.push({
          symbol: asset.symbol,
          name: asset.name,
          assetType: asset.assetType,
          stage,
          stageTitle,
          exactReason: result.rejectionReason || '4H Zaman diliminde 3 SMC kriteri (RSI, CHOCH, Sweep) eşanlı bulunamadı.',
          metrics: {
            volumeSurge: asset.dailyVolumeMillions
          }
        });
      }

      // Small async yield to keep event loop responsive and simulate realistic low-memory execution
      await new Promise(r => setTimeout(r, 45));
    }

    // Stage 3: Opportunity Clustering & Ranking (Section 5)
    broadcastScanEvent({
      stepId: 'clustering',
      agentName: 'Kümeleme & Sıralama Motoru',
      agentRole: 'Korelasyon & Relative Strength Analisti',
      status: 'PROGRESS',
      message: `Nitelikli ${opportunities.length} fırsat pairwise korelasyon matrisine sokuluyor...`,
      timestamp: new Date().toLocaleTimeString('tr-TR')
    });

    const clusters = clusterAndRankOpportunities(opportunities);
    funnelStats.clusteredThemesCount = clusters.length;

    // Stage 4: Persist Results to Tracking Database (Section 9)
    saveSignals(opportunities);
    updateFunnelStats(funnelStats);
    lastOpportunities = opportunities;
    lastClusters = clusters;
    lastScanTime = Date.now();

    const durationSeconds = +((Date.now() - startTime) / 1000).toFixed(1);

    broadcastScanEvent({
      stepId: 'complete',
      agentName: 'Orchestrator (CEO Ajanı)',
      agentRole: 'Tarama Koordinatörü',
      status: 'COMPLETE',
      message: `✅ PİYASA TARAMASI TAMAMLANDI (${durationSeconds}s). ${ASSET_UNIVERSE.length} varlıktan ${opportunities.length} adet A/A+ fırsat ${clusters.length} tematik kümede konsolide edildi.`,
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      dataPayload: {
        opportunitiesCount: opportunities.length,
        clustersCount: clusters.length,
        durationSeconds,
        funnelStats
      }
    });

    return {
      success: true,
      message: `Tarama başarıyla tamamlandı. Toplam ${opportunities.length} adet fırsat belirlendi.`,
      opportunities,
      clusters,
      funnelStats
    };
  } catch (error: any) {
    broadcastScanEvent({
      stepId: 'error',
      agentName: 'Orchestrator',
      agentRole: 'Hata Yöneticisi',
      status: 'ERROR',
      message: `Tarama hatası: ${error.message || error}`,
      timestamp: new Date().toLocaleTimeString('tr-TR')
    });

    return {
      success: false,
      message: `Tarama sırasında beklenmeyen hata oluştu: ${error.message}`
    };
  } finally {
    isScanning = false;
  }
}

/**
 * On-Demand Single Asset Oracle Analysis (Section 2.3 / 8.4)
 * Strict requirement: Uses EXACT SAME calculation logic as automatic scan!
 */
export async function executeOracleDeepDive(rawSymbol: string): Promise<{
  success: boolean;
  symbol: string;
  opportunity?: SignalOpportunity;
  rejectionReason?: string;
  macro: any;
}> {
  const { symbol, asset } = resolveAssetType(rawSymbol);
  const macro = await getMacroSnapshot();

  const analysisResult = await analyzeAssetOrchestrated(asset);

  if (analysisResult.passed && analysisResult.opportunity) {
    return {
      success: true,
      symbol,
      opportunity: analysisResult.opportunity,
      macro
    };
  } else {
    return {
      success: false,
      symbol,
      rejectionReason: analysisResult.rejectionReason || 'Varlık SMC ve çoklu zaman dilimi zorunlu kriterlerini karşılamadı.',
      macro
    };
  }
}

export function getScanStatus() {
  return {
    isScanning,
    lastScanTime,
    cachedOpportunitiesCount: lastOpportunities.length,
    cachedClustersCount: lastClusters.length,
    funnelStats: getFunnelStats()
  };
}

export function getLastScanResults() {
  return {
    opportunities: lastOpportunities.length > 0 ? lastOpportunities : getSignalsStore().filter(s => s.status === 'ACTIVE'),
    clusters: lastClusters.length > 0 ? lastClusters : clusterAndRankOpportunities(getSignalsStore().filter(s => s.status === 'ACTIVE')),
    funnelStats: getFunnelStats()
  };
}
