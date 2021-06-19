const { User } = require('../models');
const { encryptPassword } = require('../helpers');

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
        photo: file.filename || '',
      });

      return response.status(201).json({ user });
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

  async findUser(request, response) {
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
}

module.exports = new UserController();
