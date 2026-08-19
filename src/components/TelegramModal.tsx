import React, { useState } from 'react';
import { X, Send, Copy, Check, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { SignalOpportunity } from '../types';

interface TelegramModalProps {
  opportunity: SignalOpportunity | null;
  onClose: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({
  opportunity,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [customToken, setCustomToken] = useState('');
  const [customChatId, setCustomChatId] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  if (!opportunity) return null;

  const op = opportunity;
  const dirEmoji = op.direction === 'LONG' ? '🟢' : '🔴';

  const telegramMessage = `🏛️ *OLYMPUS | SİNYAL BİLDİRİMİ* 🏛️\n\n` +
    `${dirEmoji} *${op.symbol}* (${op.name}) — *${op.direction}*\n` +
    `📊 *Kurulum*: ${op.confidenceLabel} (Skor: %${op.overallScore})\n\n` +
    `🎯 *İdeal Giriş Bölgesi (FVG)*: \`${op.entryZone.min} - ${op.entryZone.max}\`\n` +
    `🛡️ *Geçersizlik Seviyesi (SL)*: \`${op.invalidationLevel}\`\n\n` +
    `📈 *Kademeli Kâr Alma Hedefleri*:\n` +
    `• *T1*: \`${op.targets.t1.price}\` (+%${op.targets.t1.percentage}) [R:R ${op.targets.t1.rr} | %${op.targets.t1.allocation} Kâr Al]\n` +
    `• *T2*: \`${op.targets.t2.price}\` (+%${op.targets.t2.percentage}) [R:R ${op.targets.t2.rr} | %${op.targets.t2.allocation} Kâr Al]\n` +
    `• *T3*: \`${op.targets.t3.price}\` (+%${op.targets.t3.percentage}) [R:R ${op.targets.t3.rr} | %${op.targets.t3.allocation} Kâr Al]\n\n` +
    `🔍 *Zorunlu Kriter Özeti*:\n` +
    `• 4H RSI: ${op.quantDetails.h4Rsi} (${op.quantDetails.divergenceType})\n` +
    `• Gövde Kırılımı (CHOCH): ${op.quantDetails.chochLevel}\n` +
    `• Likidite Sweep: ${op.quantDetails.sweepLevel}\n` +
    `• Hacim Artış Çarpanı: ${op.quantDetails.volumeSurgeRatio}x\n\n` +
    `🌐 *Makro Durum*: ${op.macroConfirmation.note}\n` +
    `📜 *Tarihsel Fraktal*: ${op.historicalSimilarity.winRatioText}\n\n` +
    `⚠️ _Orta vadeli karar destek önerisidir. Otonom emir verilmez._`;

  const handleCopy = () => {
    navigator.clipboard.writeText(telegramMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLiveDispatch = async () => {
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/telegram/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: telegramMessage,
          botToken: customToken || undefined,
          chatId: customChatId || undefined
        })
      });
      const data = await res.json();
      setSendResult(data);
    } catch (e: any) {
      setSendResult({ success: false, message: e.message || 'Gönderim başarısız' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e111a] border border-[#222838] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#131722] px-5 py-4 border-b border-[#1f2434] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#229ed9]/15 border border-[#229ed9]/30 flex items-center justify-center text-[#229ed9]">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-mono">
                TELEGRAM BİLDİRİM FORMATI (BÖLÜM 8.4)
              </h4>
              <p className="text-[11px] text-slate-400">Standart Türkçe Finans Terminolojisi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Content Preview */}
        <div className="p-5 overflow-y-auto max-h-[440px] bg-[#07090e] space-y-3">
          <div className="p-4 rounded-xl bg-[#0f131d] border border-[#1d2332] text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap shadow-inner selection:bg-amber-500/30">
            {telegramMessage}
          </div>

          {showConfig && (
            <div className="p-3.5 rounded-xl bg-[#111522] border border-[#1f2638] space-y-2 text-xs font-mono">
              <span className="text-amber-400 font-bold block text-[11px]">ÖZEL TELEGRAM BOT BİLGİLERİ (İSTEĞE BAĞLI):</span>
              <input
                type="text"
                placeholder="TELEGRAM_BOT_TOKEN (Varsayılan .env)"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0a0d14] border border-slate-700 text-slate-200 text-xs font-mono"
              />
              <input
                type="text"
                placeholder="TELEGRAM_CHAT_ID (Örn: 123456789 veya @kanal_adi)"
                value={customChatId}
                onChange={(e) => setCustomChatId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0a0d14] border border-slate-700 text-slate-200 text-xs font-mono"
              />
            </div>
          )}

          {sendResult && (
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-center space-x-2 ${
              sendResult.success 
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{sendResult.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#121520] px-5 py-3 border-t border-[#1e2332] flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-slate-400 hover:text-slate-200 text-[11px] underline cursor-pointer"
          >
            {showConfig ? 'Ayarları Gizle' : 'Bot Ayarları'}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLiveDispatch}
              disabled={isSending}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#229ed9] hover:bg-[#1e8bc0] text-white font-bold font-mono transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Gönderiliyor...' : 'Bot ile Gönder'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono transition-all shadow-md cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

