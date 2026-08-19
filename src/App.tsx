import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Layers, 
  Search, 
  BarChart3, 
  Radio, 
  Terminal, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Filter, 
  TrendingUp, 
  Lock,
  Compass
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { MacroRadar } from './components/MacroRadar';
import { OpportunityCard } from './components/OpportunityCard';
import { ClusterView } from './components/ClusterView';
import { OracleView } from './components/OracleView';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { SocialFeed } from './components/SocialFeed';
import { LiveTerminal } from './components/LiveTerminal';
import { TelegramModal } from './components/TelegramModal';
import { 
  SignalOpportunity, 
  AssetCluster, 
  MacroSnapshot, 
  TrackedPerformance, 
  FunnelStatistics, 
  SocialIntelligenceItem, 
  ScanStreamEvent 
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('cockpit');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  
  // Data states
  const [macro, setMacro] = useState<MacroSnapshot | null>(null);
  const [opportunities, setOpportunities] = useState<SignalOpportunity[]>([]);
  const [clusters, setClusters] = useState<AssetCluster[]>([]);
  const [performance, setPerformance] = useState<TrackedPerformance | null>(null);
  const [funnelStats, setFunnelStats] = useState<FunnelStatistics | null>(null);
  const [analysts, setAnalysts] = useState<SocialIntelligenceItem[]>([]);
  const [terminalEvents, setTerminalEvents] = useState<ScanStreamEvent[]>([]);
  
  // Modals & Navigation helpers
  const [selectedOpportunityForTelegram, setSelectedOpportunityForTelegram] = useState<SignalOpportunity | null>(null);
  const [oracleSearchSymbol, setOracleSearchSymbol] = useState<string>('BTCUSDT');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshingMacro, setIsRefreshingMacro] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dedicated Real-time Macro Refresh
  const handleRefreshMacro = async () => {
    setIsRefreshingMacro(true);
    try {
      const res = await fetch('/api/macro?forceRefresh=true');
      if (res.ok) {
        const freshMacro = await res.json();
        setMacro(freshMacro);
        showToast('Makro piyasa verileri borsalardan canlı olarak güncellendi.');
      }
    } catch (err) {
      console.error('Macro refresh error:', err);
      showToast('Makro veri yenilenirken bağlantı hatası oluştu.');
    } finally {
      setIsRefreshingMacro(false);
    }
  };

  // Initial Data Fetch
  const fetchAllData = async () => {
    try {
      const [macroRes, latestRes, perfRes, socialRes] = await Promise.all([
        fetch('/api/macro').then(r => r.json()),
        fetch('/api/scan/latest').then(r => r.json()),
        fetch('/api/signals/performance').then(r => r.json()),
        fetch('/api/social').then(r => r.json())
      ]);

      if (macroRes) setMacro(macroRes);
      if (latestRes) {
        setOpportunities(latestRes.opportunities || []);
        setClusters(latestRes.clusters || []);
        setFunnelStats(latestRes.funnelStats || null);
      }
      if (perfRes) setPerformance(perfRes);
      if (socialRes) setAnalysts(socialRes.analysts || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Setup Server-Sent Events (SSE) for Real-Time Terminal Live Logs
    const eventSource = new EventSource('/api/scan/stream');

    eventSource.onmessage = (event) => {
      try {
        const streamEvent: ScanStreamEvent = JSON.parse(event.data);
        setTerminalEvents((prev) => [...prev, streamEvent]);

        if (streamEvent.status === 'START') {
          setIsScanning(true);
        } else if (streamEvent.status === 'COMPLETE' || streamEvent.status === 'ERROR') {
          setIsScanning(false);
          // Refresh latest scan data upon completion
          fetchAllData();
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE connection warning:', err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Trigger Manual Scan
  const handleTriggerScan = async () => {
    if (isScanning) return;

    setIsScanning(true);
    showToast('Tarama başlatıldı. Ajanlar piyasayı inceliyor...');

    try {
      const res = await fetch('/api/scan/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRefresh: true })
      });
      const data = await res.json();

      if (!data.success) {
        showToast(data.message || 'Tarama başlatılamadı.');
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Scan trigger error:', err);
      setIsScanning(false);
    }
  };

  const handleOpenOracleDeepDive = (symbol: string) => {
    setOracleSearchSymbol(symbol);
    setActiveTab('oracle');
  };

  const filteredOpportunities = opportunities.filter((op) => {
    if (activeFilter === 'ALL') return true;
    return op.assetType === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Executive Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isScanning={isScanning}
        onTriggerScan={handleTriggerScan}
        macro={macro}
        activeSignalsCount={opportunities.length}
      />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-mono shadow-2xl flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Telegram Preview Modal */}
      <TelegramModal
        opportunity={selectedOpportunityForTelegram}
        onClose={() => setSelectedOpportunityForTelegram(null)}
      />

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: COCKPIT (Piyasa Kokpiti) */}
        {activeTab === 'cockpit' && (
          <div className="space-y-6 animate-fade-in">
            {/* Macro Cross Market Radar */}
            <MacroRadar 
              macro={macro} 
              onRefreshMacro={handleRefreshMacro}
              isRefreshing={isRefreshingMacro}
            />

            {/* Opportunities Control Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-mono text-slate-100 tracking-wide">
                    NİTELİKLİ ORTA VADELİ SWING FIRSATLARI ({filteredOpportunities.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Deterministik SMC kuralları ve çoklu zaman dilimi (1W/1D/4H/1H) onaylı sinyaller
                  </p>
                </div>
              </div>

              {/* Asset Type Filter Pills */}
              <div className="flex items-center space-x-1.5 bg-[#10131d] p-1 rounded-xl border border-[#1e2332] text-xs font-mono">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeFilter === 'ALL'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tümü ({opportunities.length})
                </button>
                <button
                  onClick={() => setActiveFilter('crypto')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeFilter === 'crypto'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Kripto
                </button>
                <button
                  onClick={() => setActiveFilter('us_stock')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeFilter === 'us_stock'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ABD Hisse
                </button>
                <button
                  onClick={() => setActiveFilter('bist')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeFilter === 'bist'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  BIST
                </button>
                <button
                  onClick={() => setActiveFilter('commodity')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeFilter === 'commodity'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Emtia
                </button>
              </div>
            </div>

            {/* Opportunities Grid */}
            {filteredOpportunities.length === 0 ? (
              <div className="p-12 text-center bg-[#0b0e15] border border-[#1b212f] rounded-2xl space-y-3">
                <ShieldCheck className="w-12 h-12 mx-auto text-slate-600" />
                <h3 className="text-sm font-bold text-slate-200 font-mono">
                  Şu Anda Filtrelere Uygun A/A+ Kurulum Bulunmuyor
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Sistem zorunlu 3 kriteri (RSI uyumsuzluğu, gövde kırılımı, likidite alımı) sağlamayan veya risk taşıyan varlıkları otomatik eler.
                </p>
                <button
                  onClick={handleTriggerScan}
                  disabled={isScanning}
                  className="mt-2 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>Yeni Tarama Başlat</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOpportunities.map((op) => (
                  <OpportunityCard
                    key={op.id}
                    opportunity={op}
                    onOpenTelegramModal={(item) => setSelectedOpportunityForTelegram(item)}
                    onOpenOracleDeepDive={handleOpenOracleDeepDive}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLUSTERS (Tematik Kümeler) */}
        {activeTab === 'clusters' && (
          <div className="animate-fade-in">
            <ClusterView
              clusters={clusters}
              onOpenTelegramModal={(item) => setSelectedOpportunityForTelegram(item)}
              onOpenOracleDeepDive={handleOpenOracleDeepDive}
            />
          </div>
        )}

        {/* TAB 3: ORACLE (Derin Analiz) */}
        {activeTab === 'oracle' && (
          <div className="animate-fade-in">
            <OracleView
              macro={macro}
              onOpenTelegramModal={(item) => setSelectedOpportunityForTelegram(item)}
              initialSymbol={oracleSearchSymbol}
            />
          </div>
        )}

        {/* TAB 4: PERFORMANCE (Sinyal Takip & Şeffaflık) */}
        {activeTab === 'performance' && (
          <div className="animate-fade-in">
            <PerformanceDashboard
              performance={performance}
              signals={opportunities}
              funnelStats={funnelStats}
            />
          </div>
        )}

        {/* TAB 5: SOCIAL (Sosyal İstihbarat) */}
        {activeTab === 'social' && (
          <div className="animate-fade-in">
            <SocialFeed analysts={analysts} />
          </div>
        )}

        {/* TAB 6: TERMINAL (Canlı Konsol) */}
        {activeTab === 'terminal' && (
          <div className="animate-fade-in">
            <LiveTerminal
              events={terminalEvents}
              isScanning={isScanning}
              onClearLogs={() => setTerminalEvents([])}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
