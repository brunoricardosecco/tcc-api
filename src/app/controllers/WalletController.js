const datefns = require('date-fns');
const ptBR = require('date-fns/locale/pt-BR');

const { database } = require('../services/database');
const { getDailyStockInfo, calculateRentability } = require('../services/external/stocks');

class WalletController {
  async index(request, response) {
    try {
      const walletId = Number(request.params.id);

      const wallet = await database.wallet.findUnique({
        where: {
          id: walletId,
        },
      });

      const stocks = await database.transaction.findMany({
        where: {
          walletId,
        },
      });

      const req = stocks.map((stock) => ({
        data: datefns.format(stock.date, 'yyyy-MM-dd'),
        ativo: stock.ticker,
        quantidade: stock.quantity,
        preço: stock.price,
      }));

      const investedAmount = await database.transaction.aggregate({
        where: {
          type: {
            equals: 'BUY',
          },
          walletId,
        },
        _sum: {
          totalAmount: true,
        },
      });

      const asset = await database.transaction.aggregate({
        where: {
          type: {
            equals: 'SELL',
          },
          walletId,
        },
        _sum: {
          totalAmount: true,
        },
      });

      const { data } = await calculateRentability(req);
      const keys = Object.keys(data);

      const actualAmount = data[keys[keys.length - 1]].saldo;
      const totalAsset = Math.abs(Number(asset._sum.totalAmount)) + Math.abs(actualAmount);
      const totalAssetPercent = ((totalAsset * 100) / Number(investedAmount._sum.totalAmount)) - 100;

      const walletWithTransactions = {
        ...wallet,
        actualAmount,
        investedAmount: Number(investedAmount._sum.totalAmount),
        totalAsset,
        totalAssetPercent,
        rentabilityPercent: ((data[keys[keys.length - 1]].vl_cota) - 1) * 100,
        history: data,

      };

      return response.status(200).json({ wallet: walletWithTransactions });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async indexByYear(request, response) {
    try {
      const walletId = Number(request.params.id);
      const year = Number(request.params.year);

      const stocks = await database.transaction.findMany({
        where: {
          AND: [
            {
              walletId,
            },
            {
              date: {
                lte: new Date(year, 11, 31),
              },
            },
            {
              date: {
                gte: new Date(year, 0, 1),
              },
            },
          ],
        },
      });

      const req = stocks.map((stock) => ({
        data: datefns.format(stock.date, 'yyyy-MM-dd'),
        ativo: stock.ticker,
        quantidade: stock.quantity,
        preço: stock.price,
      }));

      const { data } = await calculateRentability(req);
      const monthKeys = {};
      const test = [];
      const test2 = {};

      Object.keys(data).forEach((date) => {
        const [nyear, month, day] = date.split('-');
        const fMonth = datefns.format(new Date(nyear, Number(month) - 1, day), 'LLL', { locale: ptBR });
        monthKeys[fMonth.toLocaleUpperCase()] = true;

        test.push({
          date,
          ...data[date],
        });
      });
      test.forEach((stock) => {
        // eslint-disable-next-line no-unused-vars
        const [y, m, d] = stock.date.split('-');
        test2[m] = [...test2[m] || [], stock];
      });
      const months = Object.keys(monthKeys);
      const asd = [];

      Object.keys(test2).forEach((month) => {
        asd.push(
          ((test2[month][test2[month].length - 1].vl_cota / 1) - 1) * 100,
        );
      });

      return response.status(200).json({ months, walletPercent: asd });
    } catch (error) {
      console.log(error?.response?.data);
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async getYears(request, response) {
    try {
      const walletId = Number(request.params.id);

      const years = await database.transaction.findMany({
        where: {
          walletId,
        },
      });
      const yearsIndex = {};

      years.forEach((year) => {
        const date = datefns.format(year.date, 'yyyy');
        yearsIndex[date] = true;
      });
      const yearsList = Object.keys(yearsIndex);

      return response.status(200).json(yearsList);
    } catch (err) {
      console.log(err);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new WalletController();
