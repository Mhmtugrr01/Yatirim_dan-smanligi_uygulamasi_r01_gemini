import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { executeFullScan, executeOracleDeepDive, registerSSEClient, getScanStatus, getLastScanResults } from './server/scanner-service';
import { getSignalsStore, getPerformanceMetrics, getFunnelStats } from './server/signal-db';
import { getMacroSnapshot, ASSET_UNIVERSE } from './server/market-data';
import { getSocialIntelligenceFeed } from './server/agents/social-agent';
import { startSignalTracker } from './server/signal-tracker';

import { sendTelegramNotification, sendTelegramCustomMessage } from './server/telegram';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Start background price lifecycle tracker (Section 9)
  startSignalTracker();

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      engine: 'OLYMPUS Multi-Agent Cognitive Decision Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Server-Sent Events (SSE) for Real-Time Terminal Live Logs
  app.get('/api/scan/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Register active client
    registerSSEClient(res);

    // Initial greeting event
    res.write(`data: ${JSON.stringify({
      stepId: 'connected',
      agentName: 'Orchestrator (CEO Ajanı)',
      agentRole: 'Sistem Arayüzü',
      status: 'PROGRESS',
      message: 'Terminal canlı SSE bağlantısı kuruldu. OLYMPUS telemetrisi hazır.',
      timestamp: new Date().toLocaleTimeString('tr-TR')
    })}\n\n`);
  });

  // Trigger Market Scan
  app.post('/api/scan/trigger', async (req, res) => {
    const forceRefresh = req.body?.forceRefresh || false;
    const scanStatus = getScanStatus();

    if (scanStatus.isScanning) {
      return res.status(409).json({
        success: false,
        message: 'Zaten aktif bir tarama yürütülüyor. Lütfen devam eden taramanın tamamlanmasını bekleyin.'
      });
    }

    // Trigger in background and respond immediately (Section 8.4 non-blocking principle)
    executeFullScan(forceRefresh).catch(err => {
      console.error('Scan execution error:', err);
    });

    res.json({
      success: true,
      message: 'Tarama arka planda başlatıldı. Terminal akışını takip edebilirsiniz.',
      status: getScanStatus()
    });
  });

  // Get Scan Status
  app.get('/api/scan/status', (req, res) => {
    res.json(getScanStatus());
  });

  // Get Latest Scan Results (Opportunities & Clusters)
  app.get('/api/scan/latest', (req, res) => {
    res.json(getLastScanResults());
  });

  // On-Demand Oracle Deep Dive (/oracle <symbol>)
  app.post('/api/oracle', async (req, res) => {
    const { symbol } = req.body;
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Geçerli bir sembol parametresi gerekli (Örn: BTC, NVDA, THYAO, XAUUSD).' });
    }

    try {
      const result = await executeOracleDeepDive(symbol);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Oracle analizi sırasında hata oluştu.' });
    }
  });

  // Signals List
  app.get('/api/signals', (req, res) => {
    res.json({
      signals: getSignalsStore(),
      funnel: getFunnelStats()
    });
  });

  // Verified Performance Statistics (Section 9)
  app.get('/api/signals/performance', (req, res) => {
    res.json(getPerformanceMetrics());
  });

  // Macro Radar Snapshot
  app.get('/api/macro', async (req, res) => {
    try {
      const forceRefresh = req.query.forceRefresh === 'true' || req.query.forceRefresh === '1';
      const macro = await getMacroSnapshot(forceRefresh);
      res.json(macro);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Makro veriler alınamadı.' });
    }
  });

  // Social Media Intelligence Feed
  app.get('/api/social', async (req, res) => {
    try {
      const feed = await getSocialIntelligenceFeed();
      res.json({ analysts: feed });
    } catch {
      res.json({ analysts: [] });
    }
  });

  // Asset Universe Directory
  app.get('/api/universe', (req, res) => {
    res.json({
      totalCount: ASSET_UNIVERSE.length,
      assets: ASSET_UNIVERSE
    });
  });

  // Telegram Notification Simulator / Dispatch Test (Section 8.4)
  app.post('/api/telegram/test-preview', (req, res) => {
    const { opportunity } = req.body;
    if (!opportunity) {
      return res.status(400).json({ error: 'Fırsat objesi gerekli.' });
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

    res.json({
      formattedTelegramMessage: tgMessage,
      charLength: tgMessage.length
    });
  });

  // Direct Live Telegram Dispatcher (Section 8.4)
  app.post('/api/telegram/dispatch', async (req, res) => {
    const { text, botToken, chatId } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Mesaj içeriği boş olamaz.' });
    }
    const result = await sendTelegramCustomMessage(text, botToken, chatId);
    res.json(result);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OLYMPUS Engine Server running on http://localhost:${PORT}`);
  });
}

startServer();
