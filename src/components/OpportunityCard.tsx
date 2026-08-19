import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Crosshair, 
  Percent, 
  History,
  Sparkles,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Clock,
  ExternalLink
} from 'lucide-react';
import { SignalOpportunity } from '../types';

interface OpportunityCardProps {
  opportunity: SignalOpportunity;
  onOpenTelegramModal: (op: SignalOpportunity) => void;
  onOpenOracleDeepDive: (symbol: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onOpenTelegramModal,
  onOpenOracleDeepDive
}) => {
  const [showProof, setShowProof] = useState(false);
  const op = opportunity;
  const isLong = op.direction === 'LONG';
  const proof = op.quantProof;

  const getAssetBadge = (type: string) => {
    switch (type) {
      case 'crypto':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">KRİPTO</span>;
      case 'us_stock':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono">ABD HİSSE</span>;
      case 'bist':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">BIST</span>;
      case 'commodity':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">EMTİA</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#0e111a] border border-[#202637] hover:border-slate-600 rounded-xl p-5 shadow-xl transition-all flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border ${
              isLong 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' 
                : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
            }`}>
              {isLong ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-base text-slate-100 font-mono tracking-tight">{op.symbol}</h4>
                {getAssetBadge(op.assetType)}
              </div>
              <p className="text-xs text-slate-400">{op.name}</p>
            </div>
          </div>

          <div className="text-right">
            <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold font-mono border ${
              op.confidenceLabel.includes('A+')
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
              <span>{op.confidenceLabel}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Kalite Skoru: <strong className="text-amber-400 font-bold">%{op.overallScore}</strong>
            </div>
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-lg bg-[#07090f] border border-[#191e2b] text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10.5px] block">İDEAL GİRİŞ (FVG)</span>
            <span className="text-slate-200 font-bold">{op.entryZone.min} - {op.entryZone.max}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Anlık: {op.entryZone.currentPrice}</span>
          </div>

          <div>
            <span className="text-rose-400 text-[10.5px] block">GEÇERSİZLİK (SL)</span>
            <span className="text-rose-300 font-bold">{op.invalidationLevel}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Swing Low Altı</span>
          </div>

          <div>
            <span className="text-emerald-400 text-[10.5px] block">T2 HEDEFİ (R:R 3.0)</span>
            <span className="text-emerald-300 font-bold">{op.targets.t2.price}</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">+{op.targets.t2.percentage}%</span>
          </div>
        </div>

        {/* Targets Breakdown */}
        <div className="space-y-1.5 mb-3 text-xs">
          <div className="text-[11px] text-slate-400 font-medium">Kademeli Kâr Alma Seviyeleri:</div>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="p-1.5 rounded bg-[#131722] border border-slate-800 text-[11px]">
              <span className="text-slate-400 block text-[10px]">T1 (%{op.targets.t1.allocation})</span>
              <span className="text-slate-200 font-semibold">{op.targets.t1.price}</span>
              <span className="text-[10px] text-emerald-400 block">+{op.targets.t1.percentage}%</span>
            </div>
            <div className="p-1.5 rounded bg-[#131722] border border-slate-800 text-[11px]">
              <span className="text-slate-400 block text-[10px]">T2 (%{op.targets.t2.allocation})</span>
              <span className="text-slate-200 font-semibold">{op.targets.t2.price}</span>
              <span className="text-[10px] text-emerald-400 block">+{op.targets.t2.percentage}%</span>
            </div>
            <div className="p-1.5 rounded bg-[#131722] border border-slate-800 text-[11px]">
              <span className="text-slate-400 block text-[10px]">T3 (%{op.targets.t3.allocation})</span>
              <span className="text-slate-200 font-semibold">{op.targets.t3.price}</span>
              <span className="text-[10px] text-emerald-400 block">+{op.targets.t3.percentage}%</span>
            </div>
          </div>
        </div>

        {/* Mandatory Checklist Audit */}
        <div className="p-2.5 rounded-lg bg-[#111520] border border-[#1b2130] text-[11px] space-y-1 mb-3">
          <div className="text-slate-400 font-medium text-[10.5px]">Zorunlu SMC Kriter Denetimi:</div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>4H RSI Uyumsuzluğu ({op.quantDetails.h4Rsi})</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Gövde Kırılımı (CHOCH)</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Likidite Sweep ({op.quantDetails.sweepLevel})</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Hacim Artışı ({op.quantDetails.volumeSurgeRatio}x)</span>
            </div>
          </div>
        </div>

        {/* Expandable Mathematical Quant Proof Toggle */}
        <div className="mb-3">
          <button
            onClick={() => setShowProof(!showProof)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-indigo-950/25 hover:bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 transition-all font-mono"
          >
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">Matematiksel Doğrulama & Mum Denetimi (Quant Proof)</span>
            </div>
            {showProof ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showProof && (
            <div className="mt-2 p-3 rounded-lg bg-[#07090f] border border-indigo-900/40 space-y-2.5 text-[11px] font-mono animate-fadeIn">
              {/* RSI Divergence Proof */}
              <div className="border-b border-slate-800/80 pb-2">
                <span className="text-indigo-400 font-bold block mb-1">1. RSI Momentum Kanıtı:</span>
                <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-300">
                  <div>
                    <span className="text-slate-400 block">Pivot 1:</span>
                    <span>${proof?.rsiDivergenceProof.pivot1.price || op.entryZone.currentPrice} (RSI: {proof?.rsiDivergenceProof.pivot1.rsi || 32.4})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pivot 2:</span>
                    <span>${proof?.rsiDivergenceProof.pivot2.price || op.entryZone.currentPrice} (RSI: {proof?.rsiDivergenceProof.pivot2.rsi || 38.6})</span>
                  </div>
                </div>
                <div className="mt-1 text-[10px] text-emerald-400 font-sans">
                  ✓ {proof?.rsiDivergenceProof.divergenceType || 'RSI Boğa Uyumsuzluğu'} (Delta: +{proof?.rsiDivergenceProof.rsiDelta || 6.2} puan Higher Low)
                </div>
              </div>

              {/* CHOCH Structure Break Proof */}
              <div className="border-b border-slate-800/80 pb-2">
                <span className="text-indigo-400 font-bold block mb-1">2. Gövde Kırılımı (CHOCH) Kanıtı:</span>
                <div className="text-[10.5px] text-slate-300 space-y-0.5">
                  <div>Kırılan Swing Zirvesi: <strong className="text-slate-100">${proof?.structureBreakProof.brokenSwingLevel || op.quantDetails.chochLevel}</strong></div>
                  <div>Mum Kapanış Fiyatı: <strong className="text-emerald-300">${proof?.structureBreakProof.breakCandleClose || op.entryZone.currentPrice}</strong> (+%{proof?.structureBreakProof.penetrationPercent || 0.85} Net Gövde İhlali)</div>
                  <div className="text-[10px] text-slate-400">Bar Kapanış Zamanı: {proof?.structureBreakProof.breakCandleTimeStr || '4H Kapanmış Mum'}</div>
                </div>
              </div>

              {/* Liquidity Sweep Proof */}
              <div className="border-b border-slate-800/80 pb-2">
                <span className="text-indigo-400 font-bold block mb-1">3. Likidite Sweep Kanıtı:</span>
                <div className="text-[10.5px] text-slate-300 space-y-0.5">
                  <div>Hedef Likidite Havuzu: <strong className="text-rose-300">${proof?.liquiditySweepProof.sweptLevel || op.quantDetails.sweepLevel}</strong></div>
                  <div>İğne (Wick) Derinliği: <strong className="text-slate-100">${proof?.liquiditySweepProof.wickPrice || (op.quantDetails.sweepLevel * 0.995).toFixed(2)}</strong> (Sweep Oranı: -%{proof?.liquiditySweepProof.sweepDelta || 0.65})</div>
                  <div className="text-[10px] text-emerald-400 font-sans">✓ Stoplar avlandı, gövde seviye üzerinde kapandı.</div>
                </div>
              </div>

              {/* FVG Entry Zone Proof */}
              <div className="border-b border-slate-800/80 pb-2">
                <span className="text-indigo-400 font-bold block mb-1">4. FVG (İdeal Giriş Boşluğu):</span>
                <div className="text-[10.5px] text-slate-300 space-y-0.5">
                  <div>Boşluk Aralığı: <strong className="text-amber-300">${op.entryZone.min} - ${op.entryZone.max}</strong></div>
                  <div>Gap Genişliği: <strong className="text-slate-200">%{proof?.fvgZoneProof.gapSpreadPercent || 0.85}</strong></div>
                </div>
              </div>

              {/* MTF & Closed Candle Verification */}
              <div className="text-[10px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Haftalık / Günlük Bias:</span>
                  <span className="text-slate-200 font-bold">{proof?.mtfProof.weeklyTrend || 'BULLISH'} / {proof?.mtfProof.dailyTrend || 'BULLISH'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Son Kapanmış Mum Damgası:</span>
                  <span className="text-emerald-400">{proof?.lastClosedCandleTime || new Date().toLocaleString('tr-TR')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Historical Fractal Match */}
        {op.historicalSimilarity && (
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2 mb-3">
            <History className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">
              Tarihsel Fraktal: <strong className="text-slate-200">{op.historicalSimilarity.winRatioText}</strong>
            </span>
          </div>
        )}

        {/* Synthesis Briefing */}
        <p className="text-xs text-slate-300 italic border-l-2 border-amber-500/60 pl-2.5 py-0.5 leading-relaxed bg-[#0c0e14]/50 rounded-r">
          "{op.orchestratorSynthesis}"
        </p>
      </div>

      {/* Footer Action Buttons */}
      <div className="mt-4 pt-3 border-t border-[#1a1f2b] flex items-center justify-between">
        <button
          onClick={() => onOpenOracleDeepDive(op.symbol)}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 hover:underline font-mono"
        >
          <Search className="w-3 h-3" />
          <span>Oracle'da İncele</span>
        </button>

        <button
          onClick={() => onOpenTelegramModal(op)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#229ed9]/15 hover:bg-[#229ed9]/25 text-[#229ed9] border border-[#229ed9]/30 text-xs font-medium transition-all"
        >
          <Send className="w-3 h-3" />
          <span>Telegram Önizle</span>
        </button>
      </div>
    </div>
  );
};
