import React from 'react';
import { Layers, Crown, Sparkles, AlertCircle, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';
import { AssetCluster, SignalOpportunity } from '../types';
import { OpportunityCard } from './OpportunityCard';

interface ClusterViewProps {
  clusters: AssetCluster[];
  onOpenTelegramModal: (op: SignalOpportunity) => void;
  onOpenOracleDeepDive: (symbol: string) => void;
}

export const ClusterView: React.FC<ClusterViewProps> = ({
  clusters,
  onOpenTelegramModal,
  onOpenOracleDeepDive
}) => {
  if (clusters.length === 0) {
    return (
      <div className="p-12 text-center bg-[#0c0e14] border border-[#1e2330] rounded-xl text-slate-400">
        <Layers className="w-10 h-10 mx-auto text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-200">Henüz Kümelenmiş Fırsat Bulunmuyor</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Piyasa taraması tamamlandığında, korelasyon katsayısı &gt;0.75 olan varlıklar tematik liderleriyle birlikte burada listelenecektir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cluster Overview Banner */}
      <div className="bg-[#0e111a] border border-[#1e2434] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              FIRSAT KÜMELEME VE GÖRELİ GÜÇ MATRİSİ (BÖLÜM 5)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Aynı anda 30-40 varlığın benzer makro hareketle sinyal vermesi durumunda ortaya çıkan korelasyon yanılsamasını engeller. 
            Her küme içinden en yüksek <strong>Relative Strength (%35)</strong> ve <strong>Hacim Artışı (%30)</strong> skoruna sahip lider varlıklar seçilir.
          </p>
        </div>

        <div className="flex items-center space-x-4 font-mono text-xs text-slate-300 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10.5px]">TEMATİK KÜME</span>
            <strong className="text-amber-400 text-sm">{clusters.length} Adet</strong>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <span className="text-slate-500 block text-[10.5px]">ORTALAMA KORELASYON</span>
            <strong className="text-emerald-400 text-sm">r &gt; 0.75</strong>
          </div>
        </div>
      </div>

      {/* Cluster Cards */}
      <div className="space-y-8">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-[#0b0e15] border border-[#1b202c] rounded-2xl p-6 shadow-xl space-y-5"
          >
            {/* Cluster Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#181d27] gap-3">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <h4 className="text-base font-bold text-slate-100 font-mono">{cluster.themeName}</h4>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    Korelasyon: {cluster.averageCorrelation}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{cluster.description}</p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono bg-[#141824] px-3.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Küme Lideri: <strong className="text-slate-100 font-bold">{cluster.leaderAsset}</strong> (%{cluster.leaderScore})</span>
              </div>
            </div>

            {/* Top Opportunities in this cluster */}
            <div>
              <div className="text-xs font-mono text-slate-400 font-semibold mb-3 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ÖNE ÇIKAN TEMATİK FIRSATLAR ({cluster.topOpportunities.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cluster.topOpportunities.map((op) => (
                  <OpportunityCard
                    key={op.id}
                    opportunity={op}
                    onOpenTelegramModal={onOpenTelegramModal}
                    onOpenOracleDeepDive={onOpenOracleDeepDive}
                  />
                ))}
              </div>
            </div>

            {/* Weaker Correlated Assets list */}
            {cluster.weakerCorrelatedSymbols && cluster.weakerCorrelatedSymbols.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#08090d] border border-[#161a24] text-xs space-y-2">
                <div className="text-[11px] font-mono text-slate-400 font-medium flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>AYNI TEMANIN ZAYIF TEMSİLCİLERİ (Filtrelenen / Elenen Correlated Varlıklar):</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  {cluster.weakerCorrelatedSymbols.map((weak, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#10131c] border border-slate-800/80 flex items-start space-x-2 text-slate-400">
                      <span className="text-slate-300 font-bold">{weak.symbol}</span>
                      <span className="text-slate-500 text-[10px]">({weak.score}p):</span>
                      <span className="text-slate-400 text-[10.5px] leading-snug">{weak.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
