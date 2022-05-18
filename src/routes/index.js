const routes = require('express').Router();
const multer = require('multer');

const UserController = require('../app/controllers/UserController');
const AddressController = require('../app/controllers/AddressController');
const WalletController = require('../app/controllers/WalletController');
const TransactionController = require('../app/controllers/TransactionController');

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
routes.get('/user/photo/:filename', UserController.showUserPhoto);

routes.use(authMiddleware);

routes.get('/me', UserController.fullProfile);

routes.get('/user', UserController.index);
routes.get('/user/:id', UserController.indexUnique);
routes.get('/user/:id/change-password', UserController.changePassword);

routes.get('/user/:id/follow', UserController.follow);
routes.get('/user/:id/unfollow', UserController.unfollow);

routes.get('/wallets/:id', WalletController.index);
routes.get('/wallets/:id/year/:year', WalletController.indexByYear);
routes.get('/wallets/:id/years', WalletController.getYears);

routes.post('/transactions', TransactionController.store);

module.exports = routes;
