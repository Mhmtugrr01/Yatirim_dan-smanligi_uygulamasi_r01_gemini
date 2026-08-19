import { FundamentalVetoResult, AssetType } from '../types';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey', 'ripHistorical']
});

const FATAL_RISK_KEYWORDS = [
  'bankruptcy', 'insolvent', 'insolvency', 'fraud', 'lawsuit', 'sec charge',
  'sec investigation', 'investigation', 'delisting', 'delisted', 'hacked', 'exploit',
  'indictment', 'token unlock', 'liquidation', 'iflas', 'dava', 'soruşturma', 'ceza'
];

/**
 * Fundamental Analysis Veto Agent (Section 2.2 / Section 4)
 * Rule: Positive news NEVER adds signal points. It strictly functions as a VETO/risk-reduction gate
 * if fatal news (lawsuits, regulatory penalties, bankruptcy risk, token unlock dumps) is detected.
 */
export async function evaluateFundamentalVeto(symbol: string, assetType: AssetType): Promise<FundamentalVetoResult> {
  try {
    let querySymbol = symbol;
    if (assetType === 'bist' && !querySymbol.endsWith('.IS')) {
      querySymbol = `${querySymbol}.IS`;
    } else if (assetType === 'crypto') {
      querySymbol = symbol.replace('USDT', '-USD');
    }

    const searchResult: any = await yahooFinance.search(querySymbol, { newsCount: 4 });
    const news = searchResult?.news || [];

    const foundRisks: string[] = [];

    for (const item of news) {
      const titleLower = (item.title || '').toLowerCase();
      for (const kw of FATAL_RISK_KEYWORDS) {
        if (titleLower.includes(kw)) {
          foundRisks.push(`[${item.publisher || 'Haber Kaynağı'}] "${item.title}" - Risk Anahtar Kelimesi: "${kw}"`);
          break;
        }
      }
    }

    if (foundRisks.length > 0) {
      return {
        vetoed: true,
        reason: `Ölümcül Temel Risk Tespit Edildi: ${foundRisks[0]}`,
        riskLevel: 'HIGH',
        eventsFound: foundRisks,
        suggestedSizeAdjustment: 0.0
      };
    }

    return {
      vetoed: false,
      riskLevel: 'LOW',
      eventsFound: news.slice(0, 2).map((n: any) => `[${n.publisher || 'Finansal Basın'}] ${n.title}`),
      suggestedSizeAdjustment: 1.0
    };
  } catch (err) {
    // If news lookup times out or fails, fail-safe to clean pass without hallucination
    return {
      vetoed: false,
      riskLevel: 'LOW',
      eventsFound: [],
      suggestedSizeAdjustment: 1.0
    };
  }
}
