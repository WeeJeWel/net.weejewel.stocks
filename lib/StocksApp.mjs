import Homey from 'homey';
import YahooFinance from 'yahoo-finance2';

export default class StocksApp extends Homey.App {

  async onInit() {
    this.yahooFinance = new YahooFinance({
      suppressNotices: ['yahooSurvey'],
    });

    this.homey.dashboards.getWidget('large').registerSettingAutocompleteListener('symbol1', this.onStocksWidgetAutocomplete);
    this.homey.dashboards.getWidget('large').registerSettingAutocompleteListener('symbol2', this.onStocksWidgetAutocomplete);
    this.homey.dashboards.getWidget('large').registerSettingAutocompleteListener('symbol3', this.onStocksWidgetAutocomplete);
    this.homey.dashboards.getWidget('large').registerSettingAutocompleteListener('symbol4', this.onStocksWidgetAutocomplete);
  }

  async getSymbolData({ symbol }) {
    const quote = await this.yahooFinance.quote(symbol, {
      fields: ['shortName', 'symbol', 'regularMarketPrice', 'regularMarketChangePercent', 'currency'],
    });

    // TODO: Check if the market is open or closed
    const chart = await this.yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h ago
      period2: new Date(),
      interval: '5m',
    });

    return {
      symbol: quote.symbol,
      name: quote.shortName,
      price: quote.regularMarketPrice,
      currency: quote.currency,
      change: quote.regularMarketChangePercent,
      quotes: chart.quotes.map(quote => ({
        t: quote.date.getTime(),
        v: quote.close,
      })),
      // marketOpen: chart.meta.currentTradingPeriod.regular.start,
      // marketClose: chart.meta.currentTradingPeriod.regular.end,
    };
  }

  onStocksWidgetAutocomplete = async (query) => {
    if (!query) return [{
      isEmpty: true,
      name: '-',
      description: 'Clear Symbol',
    }];

    const results = await this.yahooFinance.search(query);
    return results.quotes
      .filter(quote => {
        if (!quote.symbol) return false;
        if (!quote.shortname) return false;
        return true;
      })
      .map(quote => ({
        symbol: quote.symbol,
        name: quote.shortname,
        description: `${quote.symbol} @ ${quote.exchDisp}`,
      }));
  }

}