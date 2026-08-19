import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Terminal, 
  Layers, 
  Search, 
  BarChart3, 
  Radio, 
  Sparkles,
  RefreshCw,
  Lock,
  Compass
} from 'lucide-react';
import { MacroSnapshot } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isScanning: boolean;
  onTriggerScan: () => void;
  macro: MacroSnapshot | null;
  activeSignalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isScanning,
  onTriggerScan,
  macro,
  activeSignalsCount
}) => {
  const tabs = [
    { id: 'cockpit', label: 'Piyasa Kokpiti', icon: Activity, count: activeSignalsCount },
    { id: 'clusters', label: 'Tematik Kümeler', icon: Layers },
    { id: 'oracle', label: 'Oracle Derin Analiz', icon: Search },
    { id: 'performance', label: 'Sinyal Takip & Şeffaflık', icon: BarChart3 },
    { id: 'social', label: 'Sosyal İstihbarat', icon: Radio },
    { id: 'terminal', label: 'Canlı Konsol / Terminal', icon: Terminal, highlight: isScanning }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c0e14]/90 backdrop-blur-md border-b border-[#1f2430] text-slate-100">
      {/* Top Ticker Bar */}
      <div className="border-b border-[#181c26] px-4 py-1.5 text-xs flex items-center justify-between text-slate-400 bg-[#08090d]">
        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-mono font-medium">OLYMPUS v1.0</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Çok Ajanlı Karar Destek Motoru</span>
          </div>

          {macro && (
            <>
              <div className="flex items-center space-x-1 font-mono">
                <span className="text-slate-500">DXY:</span>
                <span className={`font-semibold ${macro.dxy.trend === 'BEARISH' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {macro.dxy.value} ({macro.dxy.change24h > 0 ? '+' : ''}{macro.dxy.change24h}%)
                </span>
              </div>
              <div className="flex items-center space-x-1 font-mono">
                <span className="text-slate-500">USDT.D:</span>
                <span className={`font-semibold ${macro.usdtD.trend === 'BEARISH' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  %{macro.usdtD.value}
                </span>
              </div>
              <div className="flex items-center space-x-1 font-mono">
                <span className="text-slate-500">BTC.D:</span>
                <span className="text-sky-400 font-semibold">%{macro.btcD.value}</span>
              </div>
              <div className="flex items-center space-x-1 font-mono">
                <span className="text-slate-500">VIX:</span>
                <span className={`font-semibold ${macro.vix.status === 'NORMAL' ? 'text-slate-300' : 'text-rose-400'}`}>
                  {macro.vix.value}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1 text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Kilit: {isScanning ? 'Aktif (Tarama)' : 'Hazır'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Deterministik SMC</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('cockpit')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-700 flex items-center justify-center shadow-inner">
              <Compass className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-wider text-slate-100 font-mono">OLYMPUS</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold tracking-wide">
                  COGNITIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Orta Vadeli Çok Ajanlı Sinyal Sistemi</p>
            </div>
          </div>

          {/* Tab Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#131722] p-1 rounded-xl border border-[#232838]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/60 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                      {tab.count}
                    </span>
                  )}
                  {tab.highlight && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Trigger Button */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-trigger-scan"
              onClick={onTriggerScan}
              disabled={isScanning}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium font-mono transition-all shadow-md ${
                isScanning
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold border border-amber-400/40'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-amber-400' : 'text-black'}`} />
              <span>{isScanning ? 'Piyasa Taranıyor...' : 'Piyasayı Tara (/tarama)'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
