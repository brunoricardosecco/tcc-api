const routes = require('express').Router();

const UserController = require('../app/controllers/UserController');

const authMiddleware = require('../app/middlewares/auth');

routes.get('/', (_, res) => res.status(200).json({ message: 'connected' }));
routes.post('/user', UserController.store);
routes.post('/authenticate', UserController.authenticate);

routes.use(authMiddleware);

routes.get('/user', UserController.findUser);

module.exports = routes;
