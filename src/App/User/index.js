const model = require('./_model');
const routers = require('./_routers');

module.exports = function index(dbConnection, domainModel) {
  const modelEl = model(dbConnection);
  const routerEl = routers.createRouter(modelEl, domainModel);

  return {
    userModel: modelEl,
    userRouter: routerEl,
  };
};
