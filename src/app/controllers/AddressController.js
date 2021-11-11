const { database } = require('../services/database');

class AddressController {
  async indexCities(request, response) {
    try {
      const stateId = request.params.id;

      const foundCities = await database.city.findMany({
        where: {
          stateId: Number(stateId),
        },
      });

      return response.status(200).json({ cities: foundCities });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async indexState(_request, response) {
    try {
      const foundedStates = await database.state.findMany();

      return response.status(200).json({ states: foundedStates });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new AddressController();
