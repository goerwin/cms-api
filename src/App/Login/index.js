const router = require('./_router');
const middlewares = require('./_middlewares');

module.exports = function index(userModel, domainModel, jwtSecretKey) {
  const routerEl = router(userModel, domainModel, jwtSecretKey);

  return {
    loginRouter: routerEl,
    loginMiddlewares: middlewares
  };
};
