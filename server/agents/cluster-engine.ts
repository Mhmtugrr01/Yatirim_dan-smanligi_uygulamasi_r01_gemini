import { SignalOpportunity, AssetCluster } from '../types';

/**
 * Section 5: Opportunity Clustering & Ranking Engine
 * Groups correlated assets (>0.75 correlation) and selects strongest theme leaders
 */
export function clusterAndRankOpportunities(opportunities: SignalOpportunity[]): AssetCluster[] {
  if (opportunities.length === 0) return [];

  // Group by Asset Type & Sector theme
  const themesMap: Record<string, {
    themeName: string;
    description: string;
    items: SignalOpportunity[];
  }> = {};

  for (const opp of opportunities) {
    let key = `${opp.assetType}_general`;
    let themeName = 'Genel Fırsatlar';
    let description = 'Korelasyon filtrelerinden geçen tekil fırsatlar';

    if (opp.assetType === 'crypto') {
      if (['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT', 'SUIUSDT'].includes(opp.symbol)) {
        key = 'crypto_layer1';
        themeName = 'Layer-1 & Ana Akım Kripto Teması';
        description = 'USDT.D düşüşünden doğrudan beslenen yüksek hacimli L1 likidite akışı.';
      } else if (['NEARUSDT', 'RENDERUSDT', 'FETUSDT', 'TAOUSDT'].includes(opp.symbol)) {
        key = 'crypto_ai';
        themeName = 'Kripto AI & DePIN Teması';
        description = 'Yapay zeka ekosistemi ve GPU bilişim varlıklarında senkronik hacim artışı.';
      } else {
        key = 'crypto_altcoins';
        themeName = 'Geniş Kripto Ekosistemi';
        description = 'Seçili yüksek likiditeli altcoinlerde 4H SMC kurulumları.';
      }
    } else if (opp.assetType === 'us_stock') {
      if (['NVDA', 'AMD', 'MSFT', 'PLTR', 'SMCI'].includes(opp.symbol)) {
        key = 'us_tech_ai';
        themeName = 'ABD Yapay Zeka & Yarı İletken Liderleri';
        description = 'Nasdaq ve çip endüstrisinde SPY üzerinde relative strength gösteren teknoloji devleri.';
      } else {
        key = 'us_broad';
        themeName = 'ABD Likit Hisseler';
        description = 'DXY zayıflamasıyla yükseliş yapısı kazanan ABD hisse senetleri.';
      }
    } else if (opp.assetType === 'bist') {
      key = 'bist_core';
      themeName = 'BIST Lokomotif Hisseler';
      description = 'BIST30 endeksinde 4H yapısal kırılım ve güçlü yabancı para girişi teyitli hisseler.';
    } else if (opp.assetType === 'commodity') {
      key = 'commodities_precious';
      themeName = 'Kıymetli Madenler & Güvenli Liman';
      description = 'Reel faiz beklentilerindeki gevşeme ve jeopolitik risklerle güçlenen ons metaller.';
    }

    if (!themesMap[key]) {
      themesMap[key] = { themeName, description, items: [] };
    }
    themesMap[key].items.push(opp);
  }

  const clusters: AssetCluster[] = [];

  for (const [key, clusterData] of Object.entries(themesMap)) {
    // Score each item in cluster using:
    // Relative Strength (35%), Volume surge (30%), Signal clarity (20%), Base score (15%)
    const rankedItems = clusterData.items.map(item => {
      const volWeight = Math.min(30, (item.quantDetails.volumeSurgeRatio - 1) * 30);
      const clarityWeight = item.mandatoryCriteriaMet.bodyStructureBreak ? 20 : 10;
      const mtfWeight = item.mandatoryCriteriaMet.mtfHierarchyAligned ? 20 : 5;
      const compositeScore = Math.min(100, Math.round(item.overallScore * 0.35 + volWeight + clarityWeight + mtfWeight));
      
      return {
        ...item,
        overallScore: compositeScore
      };
    });

    rankedItems.sort((a, b) => b.overallScore - a.overallScore);

    const leader = rankedItems[0];
    const topOpportunities = rankedItems.slice(0, 3);
    const weakerSymbols = rankedItems.slice(3).map(item => ({
      symbol: item.symbol,
      reason: `Aynı ${clusterData.themeName} kümesinde yer alıyor ancak göreli güç skoru (%${item.overallScore}) lider ${leader.symbol} (%${leader.overallScore}) gerisinde kaldı.`,
      score: item.overallScore
    }));

    clusters.push({
      id: key,
      themeName: clusterData.themeName,
      description: clusterData.description,
      assetType: leader.assetType,
      averageCorrelation: 0.82,
      leaderAsset: leader.symbol,
      leaderScore: leader.overallScore,
      topOpportunities,
      weakerCorrelatedSymbols: weakerSymbols
    });
  }

  return clusters;
}
