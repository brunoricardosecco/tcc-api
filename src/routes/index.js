const routes = require('express').Router();
const multer = require('multer');

const UserController = require('../app/controllers/UserController');
const AddressController = require('../app/controllers/AddressController');
const FavoriteController = require('../app/controllers/FavoriteController');

const authMiddleware = require('../app/middlewares/auth');

const upload = multer({
  storage: multer.diskStorage({
    destination(req, __, cb) {
      cb(null, './public/uploads');
    },
    filename(req, file, cb) {
      cb(null, `${new Date().valueOf()}_${file.originalname}`);
    },
  }),
});

routes.get('/', (_, res) => res.status(200).json({ message: 'connected' }));

routes.post('/user', upload.single('file'), UserController.store);
routes.post('/authenticate', UserController.authenticate);

routes.get('/state', AddressController.indexState);
routes.get('/state/:id/cities', AddressController.indexCities);

routes.use(authMiddleware);

routes.get('/me', UserController.findUser);

routes.get('/favorite', FavoriteController.index);
routes.post('/favorite', FavoriteController.store);
routes.delete('/favorite/:id', FavoriteController.destroy);

module.exports = routes;
