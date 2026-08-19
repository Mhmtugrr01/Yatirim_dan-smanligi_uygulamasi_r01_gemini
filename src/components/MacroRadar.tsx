import React from 'react';
import { 
  Globe, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight, 
  Compass, 
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCheck
} from 'lucide-react';
import { MacroSnapshot } from '../types';

interface MacroRadarProps {
  macro: MacroSnapshot | null;
  onRefreshMacro?: () => void;
  isRefreshing?: boolean;
}

export const MacroRadar: React.FC<MacroRadarProps> = ({ macro, onRefreshMacro, isRefreshing }) => {
  if (!macro) {
    return (
      <div className="p-6 bg-[#0f121a] border border-slate-800 rounded-xl animate-pulse text-slate-500 text-xs">
        Makro radar verileri yükleniyor...
      </div>
    );
  }

  const items = [
    {
      label: 'DXY (Dolar Endeksi)',
      source: macro.dxy.source || 'Yahoo Finance (DX-Y.NYB / DX=F)',
      value: macro.dxy.value,
      change: macro.dxy.change24h,
      trend: macro.dxy.trend,
      positiveForRisk: macro.dxy.trend === 'BEARISH',
      desc: 'Düşüş trendi riskli varlıklar (Hisse & Kripto) için likiditeyi destekler.'
    },
    {
      label: 'USDT.D (Tether Dominansı)',
      source: macro.usdtD.source || 'CoinGecko Global (/market_cap_percentage.usdt)',
      value: `%${macro.usdtD.value}`,
      change: macro.usdtD.change24h,
      trend: macro.usdtD.trend,
      positiveForRisk: macro.usdtD.trend === 'BEARISH',
      desc: 'USDT dominansının düşmesi, nakitten kripto varlıklara sermaye girişini gösterir.'
    },
    {
      label: 'BTC.D (Bitcoin Dominansı)',
      source: macro.btcD.source || 'CoinGecko Global (/market_cap_percentage.btc)',
      value: `%${macro.btcD.value}`,
      change: macro.btcD.change24h,
      trend: macro.btcD.trend,
      positiveForRisk: true,
      desc: 'Bitcoin pazar payı. Altcoin döngüsü zamanlaması için takip edilir.'
    },
    {
      label: 'VIX (Korku Endeksi)',
      source: macro.vix.source || 'CBOE Volatility Index (^VIX)',
      value: macro.vix.value,
      change: macro.vix.change24h,
      trend: macro.vix.status === 'NORMAL' ? 'RANGE' : 'BULLISH',
      positiveForRisk: macro.vix.status === 'NORMAL',
      desc: 'Piyasa oynaklığı normal seviyede. Panik satışı baskısı bulunmuyor.'
    },
    {
      label: 'US10Y (ABD 10Y Tahvil)',
      source: macro.us10y.source || 'U.S. 10Y Treasury Note Yield (^TNX)',
      value: `%${macro.us10y.value}`,
      change: macro.us10y.change24h,
      trend: macro.us10y.trend === 'FALLING' ? 'BEARISH' : 'BULLISH',
      positiveForRisk: macro.us10y.trend === 'FALLING',
      desc: 'Getiri eğrisindeki gevşeme değerleme çarpanlarını rahatlatır.'
    }
  ];

  return (
    <div className="bg-[#0c0f16] border border-[#1d2230] rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <Globe className="w-5 h-5 text-amber-400" />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide">
                MAKRO ÇAPRAZ PİYASA RADARI (CANLI DOĞRULANMIŞ AKIŞ)
              </h3>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                <CheckCheck className="w-3 h-3 mr-1" /> %100 CANLI BORSA BESLEMESİ
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tüm varlık analizlerine tekil referans sağlayan global likidite göstergeleri
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {onRefreshMacro && (
            <button
              onClick={onRefreshMacro}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#161c28] hover:bg-[#20293a] border border-[#2b3548] text-xs text-slate-300 transition-all font-mono disabled:opacity-50"
              title="Makro verileri anlık borsalardan zorla yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Tazeleniyor...' : 'Veriyi Yenile'}</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 text-[11px] bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Güncelleme: <strong className="text-slate-200">{new Date(macro.timestamp).toLocaleTimeString('tr-TR')}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-[#11141e] border border-[#1f2536] hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">{item.label}</span>
                {item.positiveForRisk ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-bold font-mono text-slate-100">{item.value}</span>
                <span
                  className={`text-xs font-mono font-medium flex items-center ${
                    item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(item.change)}%
                </span>
              </div>
              <span className="text-[9.5px] text-indigo-300/80 font-mono block mt-1 truncate" title={item.source}>
                Kaynak: {item.source}
              </span>
            </div>

            <p className="text-[10.5px] text-slate-400 mt-2.5 leading-snug border-t border-[#1a1f2c] pt-2">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Synthesis Banner */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-slate-900 via-slate-900 to-[#121824] border border-[#22293b] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-300">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-200">Ajan Notu:</strong> {macro.summaryEvaluation}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
          Otomatik Önbellek & Canlı Teyit
        </span>
      </div>
    </div>
  );
};
