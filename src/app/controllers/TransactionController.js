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
          ticker: ticker?.split('.')[0],
          rawTicker: ticker,
          financialInstitution,
          date,
          quantity: type === 'BUY' ? quantity : -quantity,
          price,
          walletId,
          totalAmount:
            type === 'BUY' ? transactionTotalAmount : -transactionTotalAmount,
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
