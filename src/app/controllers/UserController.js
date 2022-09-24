const path = require('path');
const fs = require('fs');
const datefns = require('date-fns');
const { encryptPassword, compareHashes, generateToken } = require('../helpers');

const { database } = require('../services/database');
const { calculateRentability } = require('../services/external/stocks');

class UserController {
  constructor() {
    this.getRentability = this.getRentability.bind(this);
    this.index = this.index.bind(this);
    this.indexUnique = this.indexUnique.bind(this);
  }

  async store(request, response) {
    try {
      const requiredFields = [
        'name',
        'email',
        'password',
        'passwordConfirmation',
      ];

      for (const field of requiredFields) {
        if (!request.body[field]) {
          return response
            .status(400)
            .json({ message: `Missing param ${field}` });
        }
      }

      const {
        name, email, password, passwordConfirmation,
      } = request.body;
      const file = request?.file;

      if (password !== passwordConfirmation) {
        return response
          .status(400)
          .json({ message: 'Invalid param passwordConfirmation' });
      }

      const existsUser = await database.user.findUnique({
        where: {
          email,
        },
      });

      if (existsUser) {
        return response
          .status(400)
          .json({ message: 'This email already have an account' });
      }

      const hashedPassword = await encryptPassword(password);

      const wallet = await database.wallet.create({
        data: {
        },
      });

      const user = await database.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          photo: file?.filename || '',
          walletId: wallet.id,
        },
      });

      return response.status(201).json({ user });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async index(request, response) {
    try {
      const { userId } = request;
      const {
        onlyFavorited = null, name = '', stateId = '', cityId = '', startDate = '', endDate = '',
      } = request.query;

      console.log({
        stateId,
        cityId,
      });

      if (onlyFavorited) {
        JSON.parse(onlyFavorited);
      }

      const users = await database.user.findMany({
        where: {
          name: {
            contains: name,
          },
          isDiscoverable: true,
          ...(onlyFavorited === 'true' && {
            followedBy: {
              some: {
                id: userId,
              },
            },
          }),
          ...(stateId && {
            city: {
              stateId: Number(stateId),
            },
          }),
          ...(cityId && {
            cityId: Number(cityId),
          }),
        },
      });

      const withRentability = await Promise.all(
        users.map(async (user) => {
          const rentability = await this.getRentability(user.walletId, startDate, endDate);

          return {
            ...user,
            rentability,
          };
        }),
      );

      return response.status(200).json({ users: withRentability });
    } catch (error) {
      console.log(error?.response?.data);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async authenticate(request, response) {
    try {
      const requiredFields = ['email', 'password'];

      for (const field of requiredFields) {
        if (!request.body[field]) {
          return response
            .status(400)
            .json({ message: `Missing param ${field}` });
        }
      }

      const { email, password } = request.body;

      const existsUser = await database.user.findUnique({
        where: {
          email,
        },
      });

      if (!existsUser) {
        return response
          .status(400)
          .json({ message: 'Invalid email or password' });
      }

      const isValidPassword = await compareHashes(
        password,
        existsUser.password,
      );

      if (!isValidPassword) {
        return response
          .status(400)
          .json({ message: 'Invalid email or password' });
      }

      const access_token = await generateToken(existsUser);

      return response.status(200).json({ user: existsUser, access_token });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async indexUnique(request, response) {
    try {
      const { id } = request.params;

      const user = await database.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      const isFavorite = await database.user.findMany({
        where: {
          id: Number(id),
          followedBy: {
            some: {
              id: request.userId,
            },
          },
        },
      });

      const rentability = await this.getRentability(user.walletId);

      return response.status(200).json({
        user: {
          ...user,
          isFavorited: Boolean(isFavorite.length),
        },
        rentability,
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async fullProfile(request, response) {
    try {
      const { userId } = request;

      const user = await database.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      return response.status(200).json({ user });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async showUserPhoto(request, response) {
    try {
      const { filename } = request.params;
      const dirname = path.resolve();

      const fullFilePath = path.join(dirname, `public/uploads/${filename}`);

      if (!fs.existsSync(fullFilePath)) {
        return response.status(404).json({ message: 'Photo not found' });
      }

      return response.sendFile(fullFilePath);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async follow(request, response) {
    try {
      if (!request.params.id) {
        return response.status(400).json({ message: 'Missing param id' });
      }

      const { id } = request.params;
      const { userId } = request;

      if (Number(id) === userId) {
        return response
          .status(400)
          .json({ message: "An user can't favorite herself" });
      }

      const followedUser = await database.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      await database.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          following: {
            connect: {
              id: followedUser.id,
            },
          },
        },
      });

      return response.status(200).json('ok');
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async unfollow(request, response) {
    try {
      if (!request.params.id) {
        return response.status(400).json({ message: 'Missing param id' });
      }

      const { id } = request.params;
      const { userId } = request;

      if (Number(id) === userId) {
        return response
          .status(400)
          .json({ message: "An user can't unfavorite herself" });
      }

      const followedUser = await database.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      await database.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          following: {
            disconnect: {
              id: followedUser.id,
            },
          },
        },
      });

      return response.status(200).json('ok');
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async getRentability(receivedWalletId, startDate, endDate) {
    const walletId = Number(receivedWalletId);

    const stocks = await database.transaction.findMany({
      where: {
        walletId,
        ...(startDate && endDate && {
          date: {
            lte: new Date(endDate).toISOString(),
            gte: new Date(startDate).toISOString(),
          },
        }),
      },
    });
    console.log(stocks, new Date(endDate), new Date(startDate));

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

    let data = {};

    if (req.length > 0) {
      const response = await calculateRentability(req);
      data = response.data;
      const keys = Object.keys(data);

      const actualAmount = data[keys[keys.length - 1]].saldo;
      const totalAsset = Math.abs(Number(asset._sum.totalAmount)) + Math.abs(actualAmount);
      const totalAssetPercent = ((totalAsset * 100) / Number(investedAmount._sum.totalAmount)) - 100;

      return totalAssetPercent;
    }
    return 0;
  }

  async changePassword(request, response) {
    try {
      const { userId } = request;
      const { oldPassword, newPassword } = request.body;

      const user = await database.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      if (!(await compareHashes(oldPassword, user.password))) {
        return response.status(400).json({ message: 'Invalid password' });
      }

      await database.user.update({
        where: {
          id: userId,
        },
        data: {
          password: await encryptPassword(newPassword),
        },
      });

      return response.status(200).json('ok');
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateUser(request, response) {
    try {
      const { userId } = request;

      const user = await database.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      await database.user.update({
        where: {
          id: userId,
        },
        data: {
          ...request.body,
        },
      });

      return response.status(200).json('ok');
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new UserController();
