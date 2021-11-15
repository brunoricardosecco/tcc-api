const { database } = require('../services/database');
const { getDailyStockInfo } = require('../services/external/stocks');

class WalletController {
  async index(request, response) {
    try {
      const walletId = Number(request.params.id);

      const wallet = await database.wallet.findUnique({
        where: {
          id: walletId,
        },
      });

      const stocks = await database.transaction.groupBy({
        where: {
          walletId,
        },
        by: ['ticker', 'rawTicker'],
        _sum: {
          totalAmount: true,
          quantity: true,
        },
      });

      const calculatedStocks = await Promise.all(
        stocks
          .filter((stock) => stock._sum.quantity > 0)
          .map(async (stock) => {
            const { data } = await getDailyStockInfo(stock.rawTicker);

            const actualPrice = data?.['Global Quote']?.['05. price'];

            const averagePrice = Number(
              Number(stock?._sum?.totalAmount) / stock._sum.quantity,
            ).toFixed(2);

            return {
              ...stock,
              averagePrice,
              actualPrice,
              actualAmount: Number(actualPrice) * stock._sum.quantity,
              rentability: (
                (Number(actualPrice) / Number(averagePrice)) * 100 -
                100
              ).toFixed(2),
            };
          }),
      );

      const investedAmount = calculatedStocks.reduce((acc, stock) => {
        return acc + Number(stock._sum.totalAmount);
      }, 0);

      const actualAmount = calculatedStocks.reduce((acc, stock) => {
        return acc + Number(stock.actualAmount);
      }, 0);

      const walletWithTransactions = {
        ...wallet,
        investedAmount,
        actualAmount,
        rentability:
          ((Number(actualAmount) / Number(investedAmount)) * 100 - 100).toFixed(
            2,
          ) || 0,
        stocks: calculatedStocks,
      };

      return response.status(200).json({ wallet: walletWithTransactions });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new WalletController();
