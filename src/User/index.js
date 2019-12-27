const model = require('./_model');
const router = require('./_router');

module.exports = function index(dbConnection, domainModel) {
  const modelEl = model(dbConnection);
  const routerEl = router(modelEl, domainModel);

  return {
    userModel: modelEl,
    userRouter: routerEl,
  };
};
