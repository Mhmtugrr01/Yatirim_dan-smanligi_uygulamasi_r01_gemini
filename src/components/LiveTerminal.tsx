import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, Play, Pause, Trash2, Cpu, Filter, Eye } from 'lucide-react';
import { ScanStreamEvent } from '../types';

interface LiveTerminalProps {
  events: ScanStreamEvent[];
  isScanning: boolean;
  onClearLogs: () => void;
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({
  events,
  isScanning,
  onClearLogs
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('ALL');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  const filteredEvents = events.filter(e => {
    if (selectedAgentFilter === 'ALL') return true;
    return e.agentName.toLowerCase().includes(selectedAgentFilter.toLowerCase());
  });

  const getStatusBadge = (status: ScanStreamEvent['status']) => {
    switch (status) {
      case 'START':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono">BAŞLADI</span>;
      case 'PROGRESS':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono animate-pulse">İŞLENİYOR</span>;
      case 'DATA':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">VERİ</span>;
      case 'VETO':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">VETO</span>;
      case 'SUCCESS':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">ONAYLANDI</span>;
      case 'COMPLETE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-mono font-bold">TAMAMLANDI</span>;
      case 'ERROR':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/30 text-red-400 border border-red-500/40 font-mono">HATA</span>;
      default:
        return null;
    }
  };

  const getAgentColor = (name: string) => {
    if (name.includes('Orchestrator') || name.includes('CEO')) return 'text-amber-400 border-amber-500/30';
    if (name.includes('Quant') || name.includes('Teknik')) return 'text-sky-400 border-sky-500/30';
    if (name.includes('Makro')) return 'text-purple-400 border-purple-500/30';
    if (name.includes('Temel')) return 'text-rose-400 border-rose-500/30';
    if (name.includes('Kümeleme')) return 'text-emerald-400 border-emerald-500/30';
    return 'text-slate-300 border-slate-700';
  };

  return (
    <div className="bg-[#0b0d13] border border-[#1e2330] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[680px]">
      {/* Terminal Title Bar */}
      <div className="bg-[#12151e] px-4 py-3 border-b border-[#1f2433] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs font-semibold text-slate-200 tracking-wide">
              OLYMPUS MULTI-AGENT STATE GRAPH // LIVE TELEMETRY STREAM
            </span>
          </div>
          {isScanning && (
            <div className="flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-700/40 px-2 py-0.5 rounded-full font-mono animate-pulse">
              <Cpu className="w-3 h-3 animate-spin" />
              <span>AJANLAR AKTİF</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Agent Filter */}
          <div className="flex items-center space-x-1 bg-[#0c0e14] border border-[#242a3a] px-2 py-1 rounded-md text-slate-300">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={selectedAgentFilter}
              onChange={(e) => setSelectedAgentFilter(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">Tüm Ajanlar ({events.length})</option>
              <option value="Orchestrator">CEO Orchestrator</option>
              <option value="Quant">Teknik / Quant SMC</option>
              <option value="Makro">Makro Radar</option>
              <option value="Temel">Temel Analiz Veto</option>
              <option value="Kümeleme">Kümeleme Motoru</option>
            </select>
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-all ${
              autoScroll
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {autoScroll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>Oto Kaydır</span>
          </button>

          <button
            onClick={onClearLogs}
            className="flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-[11px]"
            title="Logları Temizle"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-[#07080c] space-y-2 text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
            <Terminal className="w-8 h-8 opacity-40 text-slate-500" />
            <p className="text-xs">Henüz akış logu bulunmuyor. "Piyasayı Tara" butonuyla ajanları tetikleyebilirsiniz.</p>
          </div>
        ) : (
          filteredEvents.map((ev, idx) => (
            <div
              key={`${ev.stepId}-${idx}`}
              className="p-2 rounded-lg bg-[#0d1017]/90 border border-[#1b202c] hover:border-slate-700 transition-all flex flex-col space-y-1 group"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">{ev.timestamp}</span>
                  <span className="text-slate-700">|</span>
                  <span className={`font-semibold ${getAgentColor(ev.agentName)}`}>
                    {ev.agentName}
                  </span>
                  <span className="text-slate-500 text-[10px]">({ev.agentRole})</span>
                </div>
                <div>{getStatusBadge(ev.status)}</div>
              </div>

              <div className="text-slate-200 leading-relaxed pl-2 border-l-2 border-slate-800 group-hover:border-amber-500/50 text-[11.5px]">
                {ev.message}
              </div>

              {ev.dataPayload && (
                <div className="mt-1 p-2 rounded bg-black/50 border border-slate-800/80 text-[10.5px] text-slate-400 overflow-x-auto">
                  <pre>{JSON.stringify(ev.dataPayload, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer Status */}
      <div className="bg-[#0e1119] px-4 py-2 border-t border-[#1c2130] text-[11px] text-slate-500 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-3">
          <span>Toplam Log: {events.length} satır</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">Aktif State: IDLE_PERSISTENT</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <span>Hafıza Koruması: %100 Kapalı Mum & Sıralı Bellek</span>
        </div>
      </div>
    </div>
  );
};
