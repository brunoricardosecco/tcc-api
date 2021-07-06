const { City, State } = require('../models');

class AddressController {
  async indexCities(request, response) {
    try {
      const stateId = request.params.id;

      const foundedCities = await City.findAll({
        where: {
          state_id: stateId,
        },
      });

      return response.status(200).json({ cities: foundedCities });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  async indexState(request, response) {
    try {
      const foundedStates = await State.findAll({}, { subQuery: false });

      return response.status(200).json({ states: foundedStates });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new AddressController();
