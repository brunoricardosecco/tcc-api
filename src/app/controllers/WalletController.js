const { database } = require('../services/database');

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
        by: ['ticker'],
        _sum: {
          totalAmount: true,
          quantity: true,
        },
      });

      const calculatedStocks = stocks.map((stock) => {
        return {
          ...stock,
          averagePrice: Number(
            Number(stock._sum.totalAmount) / stock._sum.quantity,
          ).toFixed(2),
        };
      });

      const walletWithTransactions = {
        ...wallet,
        stocks: calculatedStocks.filter((stock) => stock._sum.quantity > 0),
      };

      return response.status(200).json({ wallet: walletWithTransactions });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new WalletController();
