const routes = require('express').Router();
const multer = require('multer');

const UserController = require('../app/controllers/UserController');
// const AddressController = require('../app/controllers/AddressController');
// const FavoriteController = require('../app/controllers/FavoriteController');

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

// routes.get('/state', AddressController.indexState);
// routes.get('/state/:id/cities', AddressController.indexCities);
routes.get('/user/photo/:filename', UserController.showUserPhoto);

routes.use(authMiddleware);

routes.get('/me', UserController.fullProfile);

routes.get('/user', UserController.index);
routes.get('/user/:id', UserController.indexUnique);
routes.get('/user/:id/follow', UserController.follow);
// routes.get('/user/:id/unfavorite', FavoriteController.destroy);

module.exports = routes;
