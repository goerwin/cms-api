const model = require('./_model');
const router = require('./_router');

module.exports = function index(dbConnection) {
  const modelEl = model(dbConnection);
  const routerEl = router(modelEl);

  return {
    domainModel: modelEl,
    domainRouter: routerEl,
  };
};
