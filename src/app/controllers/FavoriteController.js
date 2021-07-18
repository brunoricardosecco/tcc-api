const { Favorite, User } = require('../models');

class FavoriteController {
  async store(request, response) {
    try {
      if (!request.params.id) {
        return response.status(400).json({ message: `Missing param ${id}` });
      }

      const { id } = request.params;
      const { userId } = request;

      if (id === userId) {
        return response
          .status(400)
          .json({ message: "An user can't favorite herself" });
      }

      const existsFavorite = await Favorite.findOne({
        where: {
          user_id: userId,
          favorite_id: id,
        },
      });

      if (existsFavorite) {
        return response.status(400).json({ message: 'User already favorited' });
      }

      await Favorite.create({
        user_id: userId,
        favorite_id: id,
      });

      return response.status(201).json({ message: 'success' });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async index(request, response) {
    try {
      const { userId } = request;

      const favorites = await Favorite.findAll({
        where: {
          user_id: userId,
        },
        include: [
          {
            model: User,
            as: 'favoriteUser',
          },
        ],
      });
      return response.status(201).json({ favorites });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async destroy(request, response) {
    try {
      if (!request.params.id) {
        return response
          .status(400)
          .json({ message: 'Favorite id must be provided' });
      }
      const { id } = request.params;
      const { userId } = request;

      await Favorite.destroy({
        where: {
          user_id: userId,
          favorite_id: id,
        },
      });

      return response.status(200).json({ message: 'success' });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new FavoriteController();
