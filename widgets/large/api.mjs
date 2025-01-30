export default {
  async getSymbolData({ homey, query }) {
    const { symbol } = query;
    return homey.app.getSymbolData({ symbol });
  },
};
