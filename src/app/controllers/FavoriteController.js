const { Favorite } = require('../models');

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
}

module.exports = new FavoriteController();