const axios = require('axios').default;

const baseURL = 'https://www.alphavantage.co';
const baseURL2 = 'https://trading-python-api.herokuapp.com';

const apiKey = 'UH6K1A0IBC1LUH2X';

const apiStocks = axios.create({
  baseURL,
});

const apiRentability = axios.create({
  baseURL: baseURL2,
});

function getDailyStockInfo(stockTicker) {
  return apiStocks.get(
    `/query?function=GLOBAL_QUOTE&symbol=${stockTicker}&apikey=${apiKey}`,
  );
}

function searchStock(stockTicker) {
  return apiStocks.get(
    `/query?function=SYMBOL_SEARCH&keywords=${stockTicker}&apikey=${apiKey}`,
  );
}

function calculateRentability(stocks) {
  return apiRentability.post(
    '/rentabilidade',
    stocks,
  );
}

module.exports = {
  getDailyStockInfo,
  searchStock,
  calculateRentability,
};
