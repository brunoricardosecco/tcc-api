const { Favorite, User } = require('../models');

class FavoriteController {
  async store(request, response) {
    try {
      const requiredFields = ['favoriteId'];

      for (const field of requiredFields) {
        if (!request.body[field]) {
          return response
            .status(400)
            .json({ message: `Missing param ${field}` });
        }
      }

      const { favoriteId } = request.body;
      const { userId } = request;

      if (favoriteId === userId) {
        return response
          .status(400)
          .json({ message: "An user can't favorite herself" });
      }

      const existsFavorite = await Favorite.findOne({
        where: {
          user_id: userId,
          favorite_id: favoriteId,
        },
      });

      if (existsFavorite) {
        return response.status(400).json({ message: 'User already favorited' });
      }

      const favorite = await Favorite.create({
        user_id: userId,
        favorite_id: favoriteId,
      });

      return response.status(201).json({ favorite });
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

      const deletedFavorite = await Favorite.destroy({
        where: { id },
      });

      return response.status(200).json({ favorite: deletedFavorite });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new FavoriteController();
