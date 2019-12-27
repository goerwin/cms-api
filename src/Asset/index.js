const model = require('./_model');
const byDomainRouter = require('../_routers/byDomain');

module.exports = function index(dbConnection) {
  const modelEl = model(dbConnection);
  const routerEl = byDomainRouter(modelEl);

  return {
    assetModel: modelEl,
    assetRouter: routerEl,
  };
};
