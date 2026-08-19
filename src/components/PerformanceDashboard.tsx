import React, { useState } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TrackedPerformance, SignalOpportunity, FunnelStatistics } from '../types';

interface PerformanceDashboardProps {
  performance: TrackedPerformance | null;
  signals: SignalOpportunity[];
  funnelStats: FunnelStatistics | null;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  performance,
  signals,
  funnelStats
}) => {
  const [filterAssetType, setFilterAssetType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!performance) {
    return (
      <div className="p-8 text-center bg-[#0c0e14] border border-slate-800 rounded-xl text-slate-500 text-xs">
        Performans verileri yükleniyor...
      </div>
    );
  }

  const filteredSignals = signals.filter((s) => {
    if (filterAssetType !== 'ALL' && s.assetType !== filterAssetType) return false;
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: SignalOpportunity['status']) => {
    switch (status) {
      case 'HIT_T1':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">T1 HEDEFİ VURULDU</span>;
      case 'HIT_T2':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-mono font-bold">T2 HEDEFİ VURULDU (A+)</span>;
      case 'HIT_T3':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/30 text-amber-300 border border-amber-500/50 font-mono font-bold">T3 MAKSİMUM KÂR</span>;
      case 'ACTIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono animate-pulse">AÇIK POZİSYON</span>;
      case 'INVALIDATED':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">STOP LANDI</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">KAPALI</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header & Strict Transparency Declaration */}
      <div className="bg-[#0e111a] border border-[#1e2434] rounded-2xl p-6 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                DOĞRULANMIŞ SİNYAL TAKİP & ŞEFFAFLIK RAPORU (BÖLÜM 9)
              </h3>
              <p className="text-xs text-slate-400">
                Hiçbir yapay başarı oranı vaat edilmez. Yalnızca geçmişte kapanmış gerçek sinyaller hesaplamaya dahil edilir.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kapanmış Örneklem: <strong className="text-slate-100">{performance.closedSignalsCount} Sinyal</strong></span>
          </div>
        </div>
      </div>

      {/* Top Authentic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c0f16] border border-[#1c2230] flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-mono block">GERÇEKLEŞEN WIN-RATE (KAZANMA ORANI)</span>
          <div className="flex items-baseline space-x-2 my-2">
            {performance.closedSignalsCount >= 30 ? (
              <>
                <span className="text-2xl font-bold font-mono text-emerald-400">%{performance.actualWinRatePercent}</span>
                <span className="text-xs text-slate-400 font-mono">({performance.winCount} Kazanç / {performance.lossCount} Stop)</span>
              </>
            ) : (
              <div className="flex flex-col">
                <span className="text-lg font-bold font-mono text-amber-400">
                  {performance.closedSignalsCount > 0 ? `%{performance.actualWinRatePercent}*` : 'Örneklem Toplanıyor'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {performance.closedSignalsCount}/30 Kapanmış İşlem
                </span>
              </div>
            )}
          </div>
          <p className="text-[10.5px] text-slate-400 leading-tight border-t border-slate-800/80 pt-2">
            {performance.closedSignalsCount >= 30 
              ? 'T1 veya T2 seviyesine ulaşan sinyaller kazanç sayılır.' 
              : 'Bölüm 1 Kuralı: Yeterli istatistiksel örneklem (min 30 işlem) birikmeden kesin başarı oranı vaat edilmez.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0f16] border border-[#1c2230] flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-mono block">PROFIT FACTOR (KÂR FAKTÖRÜ)</span>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{performance.profitFactor}x</span>
            <span className="text-xs text-slate-400 font-mono">(Brüt Kâr / Brüt Zarar)</span>
          </div>
          <p className="text-[10.5px] text-slate-400 leading-tight border-t border-slate-800/80 pt-2">
            Pozitif asimetrik getiri dağılımı.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0f16] border border-[#1c2230] flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-mono block">ORTALAMA RİSK/ÖDÜL ORANI</span>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-2xl font-bold font-mono text-sky-400">1 : {performance.averageRiskReward}</span>
            <span className="text-xs text-slate-400 font-mono">(Hedef / SL)</span>
          </div>
          <p className="text-[10.5px] text-slate-400 leading-tight border-t border-slate-800/80 pt-2">
            Minimum R:R 1.8 kuralı altında hesaplanan ortalama.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0f16] border border-[#1c2230] flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-mono block">ORTALAMA POZİSYON SÜRESİ</span>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {performance.averageHoldDurationHours > 0 ? `${performance.averageHoldDurationHours} Saat` : 'Canlı Takipte'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {performance.averageHoldDurationHours > 0 ? `(~${Math.round(performance.averageHoldDurationHours / 24)} Gün)` : '(4H/1D Swing)'}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 leading-tight border-t border-slate-800/80 pt-2">
            Orta vadeli (Swing) tutma süresi aralığı.
          </p>
        </div>
      </div>

      {/* Funnel Statistics Breakdown (Section 8) */}
      {funnelStats && (
        <div className="bg-[#0b0e15] border border-[#1b212f] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold font-mono text-slate-100">
                PİYASA TARAMA HUNİSİ & ELENEN VARLIK DENETİMİ (BÖLÜM 9 & 10)
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Toplam {funnelStats.totalAssetsScreened} Varlıktan {funnelStats.qualifiedOpportunitiesCount} Adet Seçildi
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#11141e] border border-slate-800 text-center">
              <span className="text-slate-400 text-[10.5px] block">1. EVREN TARAMA</span>
              <strong className="text-slate-200 text-lg block my-1">{funnelStats.totalAssetsScreened}</strong>
              <span className="text-[10px] text-slate-400">Taranan Varlık</span>
            </div>

            <div className="p-3 rounded-lg bg-[#11141e] border border-slate-800 text-center">
              <span className="text-rose-400 text-[10.5px] block">2. DÜŞÜK HACİM</span>
              <strong className="text-rose-400 text-lg block my-1">-{funnelStats.droppedAtVolumeThreshold}</strong>
              <span className="text-[10px] text-slate-400">Likidite Yetersiz</span>
            </div>

            <div className="p-3 rounded-lg bg-[#11141e] border border-slate-800 text-center">
              <span className="text-rose-400 text-[10.5px] block">3. MTF UYUMSUZLUK</span>
              <strong className="text-rose-400 text-lg block my-1">-{funnelStats.droppedAtMtfMismatch}</strong>
              <span className="text-[10px] text-slate-400">1W/1D/4H Zıt Yön</span>
            </div>

            <div className="p-3 rounded-lg bg-[#11141e] border border-slate-800 text-center">
              <span className="text-rose-400 text-[10.5px] block">4. EKSİK KRİTER</span>
              <strong className="text-rose-400 text-lg block my-1">-{funnelStats.droppedAtMissingMandatoryCriteria}</strong>
              <span className="text-[10px] text-slate-400">SMC Kriterleri Yok</span>
            </div>

            <div className="p-3 rounded-lg bg-[#11141e] border border-slate-800 text-center">
              <span className="text-rose-400 text-[10.5px] block">5. TEMEL VETO</span>
              <strong className="text-rose-400 text-lg block my-1">-{funnelStats.droppedAtFundamentalVeto}</strong>
              <span className="text-[10px] text-slate-400">Haber / Bilanço Riski</span>
            </div>

            <div className="p-3 rounded-lg bg-[#141d24] border border-emerald-500/40 text-center">
              <span className="text-emerald-400 text-[10.5px] block">6. NİTELİKLİ SİNYAL</span>
              <strong className="text-emerald-300 text-lg block my-1">+{funnelStats.qualifiedOpportunitiesCount}</strong>
              <span className="text-[10px] text-emerald-400 font-semibold">{funnelStats.clusteredThemesCount} Tematik Küme</span>
            </div>
          </div>

          {/* Detailed Per-Asset Elimination Inspector */}
          {funnelStats.eliminatedAssets && funnelStats.eliminatedAssets.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold text-slate-300">
                  Elenen Varlıkların Tekil Neden Dökümü ({funnelStats.eliminatedAssets.length} Varlık):
                </span>
                <span className="text-[10.5px] text-slate-400 font-mono">
                  Sıfır-Gürültü & Şeffaf Filtreleme
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-lg bg-[#07090e] border border-slate-800/90 divide-y divide-slate-800/60 text-xs font-mono">
                {funnelStats.eliminatedAssets.map((item, idx) => (
                  <div key={idx} className="p-2.5 hover:bg-slate-900/40 flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100">{item.symbol}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 uppercase">
                        {item.assetType}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-400 font-medium block text-[11px]">[{item.stageTitle}]</span>
                      <span className="text-slate-400 text-[10.5px]">{item.exactReason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Signals History Table */}
      <div className="bg-[#0b0e15] border border-[#1b212f] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#181d27] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold font-mono text-slate-100">
              SİNYAL TAKİP KAYITLARI & AKTİF POZİSYONLAR ({filteredSignals.length})
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Üretilen tüm önerilerin şeffaf durum takibi</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <select
              value={filterAssetType}
              onChange={(e) => setFilterAssetType(e.target.value)}
              className="bg-[#131722] text-slate-300 border border-[#232838] px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
            >
              <option value="ALL">Tüm Varlık Türleri</option>
              <option value="crypto">Kripto</option>
              <option value="us_stock">ABD Hisse</option>
              <option value="bist">BIST</option>
              <option value="commodity">Emtia</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#131722] text-slate-300 border border-[#232838] px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="ACTIVE">Aktif</option>
              <option value="HIT_T1">Hit T1</option>
              <option value="HIT_T2">Hit T2</option>
              <option value="HIT_T3">Hit T3</option>
              <option value="INVALIDATED">Stoplandı</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#10131d] text-slate-400 border-b border-[#1a1f2c]">
              <tr>
                <th className="p-3.5">Varlık</th>
                <th className="p-3.5">Yön</th>
                <th className="p-3.5">Giriş Bölgesi</th>
                <th className="p-3.5">Geçersizlik (SL)</th>
                <th className="p-3.5">T2 Hedefi</th>
                <th className="p-3.5">Skor</th>
                <th className="p-3.5">Sonuç / Durum</th>
                <th className="p-3.5 text-right">Getiri (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151924] text-slate-300">
              {filteredSignals.map((sig) => (
                <tr key={sig.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-slate-100">{sig.symbol}</span>
                    <span className="text-[10.5px] text-slate-500 block">{sig.name}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`font-semibold ${sig.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sig.direction}
                    </span>
                  </td>
                  <td className="p-3.5">{sig.entryZone.min} - {sig.entryZone.max}</td>
                  <td className="p-3.5 text-rose-400">{sig.invalidationLevel}</td>
                  <td className="p-3.5 text-emerald-400">{sig.targets.t2.price}</td>
                  <td className="p-3.5 font-bold text-amber-400">%{sig.overallScore}</td>
                  <td className="p-3.5">{getStatusBadge(sig.status)}</td>
                  <td className="p-3.5 text-right font-bold">
                    {sig.currentReturn !== undefined ? (
                      <span className={sig.currentReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {sig.currentReturn >= 0 ? '+' : ''}{sig.currentReturn}%
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
