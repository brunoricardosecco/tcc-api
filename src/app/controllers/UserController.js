const path = require('path');
const fs = require('fs');
const { encryptPassword, compareHashes, generateToken } = require('../helpers');

const { database } = require('../services/database');

class UserController {
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

      const { name, email, password, passwordConfirmation } = request.body;
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
          actual_amount: 0,
          invested_amount: 0,
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
      const { onlyFavorited = null, name = '' } = request.query;

      if (onlyFavorited) {
        JSON.parse(onlyFavorited);
      }

      const users = await database.user.findMany({
        where: {
          name: {
            contains: name,
          },
          ...(onlyFavorited === 'true' && {
            followedBy: {
              some: {
                id: userId,
              },
            },
          }),
        },
      });

      return response.status(200).json({ users });
    } catch (error) {
      console.log(error);
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

      return response.status(200).json({
        user,
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
}

module.exports = new UserController();
