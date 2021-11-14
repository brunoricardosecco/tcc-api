const { database } = require('../services/database');

class TransactionController {
  async store(request, response) {
    try {
      const requiredFields = [
        'type',
        'category',
        'ticker',
        'financialInstitution',
        'date',
        'quantity',
        'price',
        'walletId',
      ];

      for (const field of requiredFields) {
        if (!request.body[field]) {
          return response
            .status(400)
            .json({ message: `Missing param ${field}` });
        }
      }

      const {
        type,
        category,
        ticker,
        financialInstitution,
        date,
        quantity,
        price,
        walletId,
      } = request.body;
      const transactionTotalAmount = price * quantity;

      const transaction = await database.transaction.create({
        data: {
          type,
          category,
          ticker,
          financialInstitution,
          date,
          quantity: type === 'BUY' ? quantity : -quantity,
          price: type === 'BUY' ? price : -price,
          walletId,
          totalAmount:
            type === 'BUY' ? transactionTotalAmount : -transactionTotalAmount,
        },
      });

      const foundWallet = await database.wallet.findUnique({
        where: { id: walletId },
      });

      const investedAmount =
        transaction.type === 'BUY'
          ? Number(foundWallet.investedAmount) + transactionTotalAmount
          : Number(foundWallet.investedAmount) - transactionTotalAmount;

      await database.wallet.update({
        where: { id: walletId },
        data: {
          investedAmount,
        },
      });

      return response.status(200).json({ transaction });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new TransactionController();
