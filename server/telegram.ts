import { SignalOpportunity } from './types';

export async function sendTelegramNotification(opportunity: SignalOpportunity) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram] Credentials not found. Skipping push notification.');
    return;
  }

  const op = opportunity;
  const dirEmoji = op.direction === 'LONG' ? '🟢' : '🔴';

  const tgMessage = `🏛️ *OLYMPUS | SİNYAL BİLDİRİMİ* 🏛️\n\n` +
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

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: tgMessage,
        parse_mode: 'Markdown'
      })
    });
    console.log(`[Telegram] Sinyal gönderildi: ${op.symbol}`);
  } catch (error) {
    console.error('[Telegram] Sinyal gönderim hatası:', error);
  }
}

export async function sendTelegramCustomMessage(text: string, customToken?: string, customChatId?: string): Promise<{ success: boolean; message: string }> {
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { success: false, message: 'Telegram Bot Token veya Chat ID girilmedi. Lütfen ayarlarınızı kontrol edin.' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
    const json: any = await res.json();
    if (json.ok) {
      return { success: true, message: 'Telegram bildirimi gerçek Telegram botunuza başarıyla iletildi.' };
    } else {
      return { success: false, message: json.description || 'Telegram API hatası' };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Bağlantı hatası' };
  }
}

