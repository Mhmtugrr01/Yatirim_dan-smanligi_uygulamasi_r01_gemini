import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Crosshair, 
  CheckCircle2, 
  XCircle, 
  History, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Globe, 
  Send, 
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SignalOpportunity, MacroSnapshot } from '../types';

interface OracleViewProps {
  macro: MacroSnapshot | null;
  onOpenTelegramModal: (op: SignalOpportunity) => void;
  initialSymbol?: string;
}

export const OracleView: React.FC<OracleViewProps> = ({
  macro,
  onOpenTelegramModal,
  initialSymbol = 'BTCUSDT'
}) => {
  const [symbolInput, setSymbolInput] = useState<string>(initialSymbol);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    success: boolean;
    symbol: string;
    opportunity?: SignalOpportunity;
    rejectionReason?: string;
  } | null>(null);

  const QUICK_SYMBOLS = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'NVDA', name: 'Nvidia' },
    { symbol: 'THYAO', name: 'Türk Hava Yolları' },
    { symbol: 'XAUUSD', name: 'Ons Altın' },
    { symbol: 'SOLUSDT', name: 'Solana' },
    { symbol: 'PLTR', name: 'Palantir' },
    { symbol: 'GARAN', name: 'Garanti BBVA' },
    { symbol: 'SMCI', name: 'SuperMicro (Risk Testi)' }
  ];

  const handleQuery = async (targetSymbol?: string) => {
    const sym = targetSymbol || symbolInput;
    if (!sym) return;

    setLoading(true);
    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: sym })
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        symbol: sym,
        rejectionReason: 'Oracle sunucu bağlantı hatası.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Search Box */}
      <div className="bg-[#0d1017] border border-[#1e2330] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Search className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              ORACLE DERİN ANALİZ MERKEZİ (/oracle &lt;sembol&gt;)
            </h3>
            <p className="text-xs text-slate-400">
              Otomatik taramanın kullandığı aynı deterministik hesaplama fonksiyonuyla tekil varlık derin analizi (Bölüm 2.3).
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              id="oracle-symbol-input"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              placeholder="Varlık sembolü girin (Örn: BTCUSDT, NVDA, THYAO, XAUUSD, SOL)..."
              className="w-full bg-[#07090e] border border-[#232838] focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-mono outline-none transition-all shadow-inner"
            />
            <span className="absolute right-3 top-3 text-[11px] font-mono text-slate-500 hidden sm:block">
              ENTER ↵
            </span>
          </div>

          <button
            id="btn-run-oracle"
            onClick={() => handleQuery()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer"
          >
            {loading ? <Cpu className="w-4 h-4 animate-spin text-black" /> : <Sparkles className="w-4 h-4 text-black" />}
            <span>{loading ? 'Ajanlar İnceliyor...' : 'Oracle Sorgula'}</span>
          </button>
        </div>

        {/* Quick Tickers */}
        <div className="flex items-center space-x-2 mt-4 text-xs overflow-x-auto pb-1 scrollbar-none">
          <span className="text-slate-500 text-[11px] font-mono flex-shrink-0">Hızlı Varlıklar:</span>
          {QUICK_SYMBOLS.map((qs) => (
            <button
              key={qs.symbol}
              onClick={() => {
                setSymbolInput(qs.symbol);
                handleQuery(qs.symbol);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-[#232838] text-[11px] font-mono flex-shrink-0 transition-all"
            >
              {qs.symbol} ({qs.name})
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="space-y-6">
          {result.success && result.opportunity ? (
            <div className="bg-[#0b0e15] border border-[#1b212f] rounded-2xl p-6 shadow-2xl space-y-6">
              {/* Opportunity Top Status */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#181d28] gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base border ${
                    result.opportunity.direction === 'LONG'
                      ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                      : 'bg-rose-950/50 text-rose-400 border-rose-800'
                  }`}>
                    {result.opportunity.direction === 'LONG' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold font-mono text-slate-100">{result.opportunity.symbol}</h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
                        SMC NİTELİKLİ {result.opportunity.direction}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{result.opportunity.name} • {result.opportunity.confidenceLabel}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right font-mono">
                    <span className="text-slate-500 text-[11px] block">KALİTE SKORU</span>
                    <strong className="text-amber-400 text-lg">%{result.opportunity.overallScore}</strong>
                  </div>
                  <button
                    onClick={() => onOpenTelegramModal(result.opportunity!)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#229ed9]/15 hover:bg-[#229ed9]/25 text-[#229ed9] border border-[#229ed9]/40 text-xs font-semibold font-mono"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram Metni</span>
                  </button>
                </div>
              </div>

              {/* SMC Execution Parameters Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
                <div className="p-4 rounded-xl bg-[#101420] border border-slate-800">
                  <span className="text-slate-500 text-xs block">İDEAL GİRİŞ (FVG)</span>
                  <span className="text-slate-100 font-bold text-base mt-1 block">
                    {result.opportunity.entryZone.min} - {result.opportunity.entryZone.max}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">Anlık Fiyat: {result.opportunity.entryZone.currentPrice}</span>
                </div>

                <div className="p-4 rounded-xl bg-[#101420] border border-rose-900/40">
                  <span className="text-rose-400 text-xs block">GEÇERSİZLİK (STOP LOSS)</span>
                  <span className="text-rose-300 font-bold text-base mt-1 block">
                    {result.opportunity.invalidationLevel}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">Wick Sweep Seviyesi Altı</span>
                </div>

                <div className="p-4 rounded-xl bg-[#101420] border border-emerald-900/40">
                  <span className="text-emerald-400 text-xs block">T2 HEDEFİ (R:R 3.0)</span>
                  <span className="text-emerald-300 font-bold text-base mt-1 block">
                    {result.opportunity.targets.t2.price}
                  </span>
                  <span className="text-[11px] text-emerald-400/80 block mt-1">
                    +% {result.opportunity.targets.t2.percentage} (%{result.opportunity.targets.t2.allocation} Kâr)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#101420] border border-slate-800">
                  <span className="text-slate-500 text-xs block">RİSK/ÖDÜL HİYERARŞİSİ</span>
                  <span className="text-amber-300 font-bold text-base mt-1 block">
                    T1: {result.opportunity.targets.t1.rr} | T3: {result.opportunity.targets.t3.rr}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">Kademeli Kâr: 30 / 30 / 40</span>
                </div>
              </div>

              {/* Detailed Quantitative Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: SMC Mandatory Verification */}
                <div className="p-5 rounded-xl bg-[#0e111a] border border-[#1d2332] space-y-3">
                  <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zorunlu Çekirdek Kriterler (Bölüm 4.1)</span>
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#121622] border border-slate-800/80 flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-200 block">1. RSI Momentum Uyumsuzluğu:</strong>
                        <p className="text-slate-400 text-[11px]">
                          4H RSI Seviyesi: {result.opportunity.quantDetails.h4Rsi}. Fiyat yeni dip/tepe yaparken RSI diverjansı teyit edildi ({result.opportunity.quantDetails.divergenceType}).
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#121622] border border-slate-800/80 flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-200 block">2. Gövde Kapanışlı Yapı Kırılımı (CHOCH):</strong>
                        <p className="text-slate-400 text-[11px]">
                          Fiyat {result.opportunity.quantDetails.chochLevel} swing seviyesini <strong>mum gövdesiyle</strong> yukarı kırdı (Fitil ihlali değil).
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#121622] border border-slate-800/80 flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-200 block">3. Likidite Sweep (Wick Temizliği):</strong>
                        <p className="text-slate-400 text-[11px]">
                          Kırılımdan hemen önce {result.opportunity.quantDetails.sweepLevel} likidite havuzu temizlendi ve fiyatta ani reddetme gerçekleşti.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Historical Pattern & Fundamental */}
                <div className="space-y-4">
                  {/* Historical Similarity */}
                  <div className="p-5 rounded-xl bg-[#0e111a] border border-[#1d2332] space-y-3">
                    <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                      <History className="w-4 h-4 text-amber-400" />
                      <span>Tarihsel Fraktal Benzerlik Modülü (Bölüm 7)</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.opportunity.historicalSimilarity.summaryNote}
                    </p>
                    <div className="p-3 rounded-lg bg-[#121622] border border-slate-800 text-xs font-mono flex items-center justify-between">
                      <span className="text-slate-400">Sonuç İstatistiği:</span>
                      <strong className="text-emerald-400">{result.opportunity.historicalSimilarity.winRatioText}</strong>
                    </div>
                  </div>

                  {/* Fundamental Veto & Macro */}
                  <div className="p-5 rounded-xl bg-[#0e111a] border border-[#1d2332] space-y-2">
                    <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>Makro Çapraz Teyit & Temel Analiz Denetimi</span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {result.opportunity.macroConfirmation.note}
                    </p>
                    <div className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Temel Analiz Vetosu: Temiz (Kilit açılımı, SEC soruşturması veya iflas riski yok)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CEO Orchestrator Executive Note */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#151c28] border border-amber-500/30 text-xs leading-relaxed text-slate-200">
                <span className="text-amber-400 font-bold font-mono block mb-1">
                  🏛️ ORCHESTRATOR (CEO AJANI) RESMİ GEREKÇE METNİ:
                </span>
                <p className="italic text-slate-300">{result.opportunity.orchestratorSynthesis}</p>
              </div>
            </div>
          ) : (
            /* Rejection Audit Card */
            <div className="bg-[#120e14] border border-rose-900/40 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold font-mono text-slate-100">
                    {result.symbol} — SİNYAL ONAYLANMADI (KRİTERLER KARŞILANMADI)
                  </h4>
                  <p className="text-xs text-rose-400/90 font-mono">Deterministik SMC Eleme Raporu</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0d090f] border border-rose-950/60 text-xs text-slate-300 leading-relaxed">
                <strong className="text-rose-300 block mb-1">Eleme / Veto Gerekçesi:</strong>
                {result.rejectionReason}
              </div>

              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                Sistem hiçbir zaman zorunlu 3 kriteri (RSI uyumsuzluğu + Gövde CHOCH + Likidite Sweep) sağlamayan veya zaman dilimi hiyerarşisi çelişen varlıklarda sinyal üretmez.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
