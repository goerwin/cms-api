const model = require('./_model');
const byDomainRouter = require('../_routers/byDomain');

module.exports = function index(dbConnection) {
    const modelEl = model(dbConnection);
    const routerEl = byDomainRouter.createRouter(modelEl);

    return {
        postModel: modelEl,
        postRouter: routerEl,
    };
};
