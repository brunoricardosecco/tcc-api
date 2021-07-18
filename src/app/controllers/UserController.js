const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

const { User, Favorite } = require('../models');
const { encryptPassword } = require('../helpers');
const FavoriteController = require('./FavoriteController');

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

      const existsUser = await User.findOne({
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

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        photo: file?.filename || '',
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

      if (onlyFavorited === 'true') {
        return FavoriteController.index(request, response);
      }

      const users = await User.findAll({
        where: {
          name: {
            [Op.iLike]: `%${name}%`,
          },
        },
      });

      const assignFavoritedUsersPromise = users.map(async (user) => {
        const favorite = await Favorite.findOne({
          where: {
            user_id: userId,
            favorite_id: user.id,
          },
        });
        const newUser = { ...user.toJSON() };
        if (favorite) {
          return Object.assign(newUser, { isFavorited: true });
        }
        return Object.assign(newUser, { isFavorited: false });
      });

      const formattedUsers = await Promise.all(assignFavoritedUsersPromise);

      return response.status(200).json({ users: formattedUsers });
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

      const existsUser = await User.findOne({
        where: {
          email,
        },
      });

      if (!existsUser) {
        return response
          .status(400)
          .json({ message: 'Invalid email or password' });
      }

      const isValidPassword = await existsUser.checkPassword(password);

      if (!isValidPassword) {
        return response
          .status(400)
          .json({ message: 'Invalid email or password' });
      }

      const access_token = existsUser.generateToken();

      return response.status(200).json({ user: existsUser, access_token });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async indexUnique(request, response) {
    try {
      const { id } = request.params;
      const { userId } = request;

      const user = await User.findByPk(id);

      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      const favorite = await Favorite.findOne({
        where: {
          user_id: userId,
          favorite_id: id,
        },
      });

      if (favorite) {
        return response.status(200).json({
          user: {
            ...user.toJSON(),
            isFavorited: true,
          },
        });
      }

      return response.status(200).json({
        user: {
          ...user.toJSON(),
          isFavorited: false,
        },
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async fullProfile(request, response) {
    try {
      const { userId } = request;

      const user = await User.findByPk(userId);

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
}

module.exports = new UserController();
