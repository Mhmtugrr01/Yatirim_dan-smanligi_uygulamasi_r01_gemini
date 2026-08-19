import React from 'react';
import { Radio, ShieldCheck, XCircle, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { SocialIntelligenceItem } from '../types';

interface SocialFeedProps {
  analysts: SocialIntelligenceItem[];
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ analysts }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0e111a] border border-[#1e2434] rounded-2xl p-6 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                SOSYAL MEDYA İSTİHBARAT & ANALİST DENETİM HAVUZU (BÖLÜM 6)
              </h3>
              <p className="text-xs text-slate-400">
                Takip edilen analistlerin geçmiş 3 aylık başarı oranı tartılır; hiçbir öneri doğrudan kullanılmaz, OLYMPUS Quant Motoru'nda denetlenir.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Kriter: <strong className="text-amber-400">Win Rate &gt; %60 + Geçmiş Tutarlılık</strong></span>
          </div>
        </div>
      </div>

      {/* Analyst Feeds & System Audits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysts.map((item) => {
          const isApproved = item.systemVerdict === 'APPROVED_QUALIFIED';

          return (
            <div
              key={item.id}
              className="bg-[#0c0f16] border border-[#1d2230] hover:border-slate-700 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Analyst Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#181d27]">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.avatar}
                      alt={item.analyst}
                      className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm text-slate-100">{item.analyst}</span>
                        <span className="text-xs text-slate-500 font-mono">{item.handle}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                        <span>Skor: <strong className="text-amber-400 font-mono">%{item.trackRecordScore}</strong></span>
                        <span>•</span>
                        <span>3 Aylık Başarı: <strong className="text-emerald-400 font-mono">%{item.threeMonthWinRate}</strong></span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">{item.timestamp}</span>
                </div>

                {/* Social Post Snippet */}
                <div className="mt-3 p-3 rounded-lg bg-[#07090e] border border-[#161a24] text-xs text-slate-300 font-mono">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {item.recommendedAsset}
                    </span>
                    <span className={`font-semibold ${item.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.direction} (Hedef: {item.targetPrice})
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] italic mt-1 leading-relaxed">"{item.postSnippet}"</p>
                </div>
              </div>

              {/* OLYMPUS Quant Engine Audit Decision */}
              <div className={`p-3 rounded-lg border text-xs ${
                isApproved
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
              }`}>
                <div className="flex items-center space-x-1.5 font-bold font-mono text-[11px] mb-1">
                  {isApproved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>OLYMPUS QUANT DENETİMİ: ONAYLANDI (A+)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>OLYMPUS QUANT DENETİMİ: REDDEDİLDİ</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {item.verdictNote}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
