const model = require('./_model');
const routers = require('./_routers');

module.exports = function index(dbConnection) {
  const modelEl = model(dbConnection);
  const routerEl = routers.createRouter(modelEl);

  return {
    domainModel: modelEl,
    domainRouter: routerEl,
  };
};
