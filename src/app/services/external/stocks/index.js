const axios = require('axios').default;

const baseURL = 'https://www.alphavantage.co';

const apiKey = 'UH6K1A0IBC1LUH2X';

const api = axios.create({
  baseURL,
});

function getDailyStockInfo(stockTicker) {
  return api.get(
    `/query?function=TIME_SERIES_DAILY&symbol=${stockTicker}&apikey=${apiKey}`,
  );
}

function searchStock(stockTicker) {
  return api.get(
    `/query?function=SYMBOL_SEARCH&keywords=${stockTicker}&apikey=${apiKey}`,
  );
}

module.exports = {
  getDailyStockInfo,
  searchStock,
};
