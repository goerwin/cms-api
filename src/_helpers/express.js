const express = require('express');
const bodyParser = require('body-parser');
const pick = require('lodash/pick');
const password = require('./password');
const database = require('./database');
const object = require('./object');
const { requiredObjProps, validateObj } = require('./validator');

function handleError(res, err) {
  try {
    res.status(500).json(JSON.parse(err.message));
  } catch (_) {
    res.status(500).json({ message: err && err.message });
  }
}

function getTransformedObj(data, propsToTransform) {
  return Promise.all(
    propsToTransform.map((propToTransform) =>
      propToTransform[1] === 'hashPassword'
        ? password.createHashedPassword(data[propToTransform[0]])
        : data[propToTransform[0]]
    )
  )
    .then((propsTransformed) =>
      propsTransformed.reduce((acc, propTransformed, idx) => {
        acc[propsToTransform[idx][0]] = propTransformed;

        return acc;
      }, {})
    )
    .then((transformedObj) => ({ ...data, ...transformedObj }));
}

function parseQuery(query, data) {
  return object.replaceObjValues(query, [[/\{(.*)\}/, (_, p1) => data[p1]]]);
}

function createCRUDRouter(mongooseDBModel, attrs) {
  const {
    findItemKey,
    findItemQuery,
    propsRequired,
    propsToTransform = [],
    propsToValidate,
    respondWithProps,
  } = attrs;

  const router = express.Router();

  router.use(bodyParser.json());

  router.get('/', (req, res) => {
    mongooseDBModel
      .find({})
      .then((items) =>
        res.json(items.map((item) => pick(item, respondWithProps)))
      )
      .catch((err) => handleError(res, err));
  });

  router.post('/', (req, res) => {
    Promise.all([
      requiredObjProps(req.body, propsRequired),
      validateObj(req.body, propsToValidate),
    ])
      .then(([data]) => getTransformedObj(data, propsToTransform))
      .then((transformedData) => new mongooseDBModel(transformedData).save())
      .then((data) => res.json(pick(data, respondWithProps)))
      .catch((err) => handleError(res, err));
  });
  // TODO: PASS THIS TOO IN CONFIG SOMEHOW
  // DomainModel = global.dummyModels[0];
  // UserModel = global.dummyModels[1];
  // router.get('/domainsByUser/:username', (req, res) => {
  //     req.params.username;

  //     UserModel.findOne({
  //         username: req.params.username,
  //     })
  //         .then((user) => pick(user, ['domains']))
  //         .then(({ domains }) =>
  //             DomainModel.find()
  //                 .where('_id')
  //                 .in(domains)
  //                 .exec()
  //         )
  //         .then((result) => {
  //             res.json(result);
  //         });
  // });

  router.get(`/:${findItemKey}`, (req, res) => {
    mongooseDBModel
      .findOne(parseQuery(findItemQuery, req.params))
      .then((item) => res.json(pick(item, respondWithProps)))
      .catch((err) => handleError(res, err));
  });

  router.patch(`/:${findItemKey}`, (req, res) => {
    Promise.resolve([req.body, Object.keys(req.body)])
      .then(([data, patchProps]) =>
        Promise.all([
          data,
          propsToTransform.filter((el) => patchProps.includes(el[0])),
          requiredObjProps(
            data,
            propsRequired.filter((el) => patchProps.includes(el))
          ),
          validateObj(
            data,
            propsToValidate.filter((el) => patchProps.includes(el[0]))
          ),
        ])
      )
      .then(([data, newPropsToTransform]) =>
        getTransformedObj(data, newPropsToTransform)
      )
      .then((transformedData) =>
        mongooseDBModel.findOneAndUpdate(
          parseQuery(findItemQuery, req.params),
          transformedData,
          { new: true }
        )
      )
      .then((item) => res.json(pick(item, respondWithProps)))
      .catch((err) => handleError(res, err));
  });

  router.delete(`/:${findItemKey}`, (req, res) => {
    mongooseDBModel
      .deleteOne(parseQuery(findItemQuery, req.params))
      .then((item) => res.json(pick(item, respondWithProps)))
      .catch((err) => handleError(res, err));
  });

  return router;
}

function createCRUDApp(dbUrl, entries, options = {}) {
  const app = express();
  const { middlewares = [], dbOptions } = options;
  const { models } = database.createDatabase(dbUrl, entries, dbOptions);

  middlewares.forEach((mw) => app.use(mw));

  // global.dummyModels = models;

  const routers = models.map((model, idx) => {
    const router = createCRUDRouter(model, entries[idx].crudAttrs);

    app.use(
      entries[idx].path,
      ...[...(entries[idx].middlewares || []), router]
    );

    return router;
  });

  return { app, models, routers };
}

function createUserLoginRouter(mongooseUserModel, attrs = {}) {
  const { query, respondWithProps, passwordKey } = attrs;
  const { propsRequired, propsToValidate } = attrs;

  const router = express.Router();

  router.use(bodyParser.json());

  router.post('/', (req, res) => {
    requiredObjProps(req.body, propsRequired)
      .then((params) => validateObj(params, propsToValidate))
      .then((data) =>
        Promise.all([
          mongooseUserModel.findOne(parseQuery(query, data)),
          data[passwordKey],
        ])
      )
      .then(([user, password]) =>
        Promise.all([password.comparePasswords(password, user.password), user])
      )
      .then(([, user]) => res.json(pick(user, respondWithProps)))
      .catch((err) => handleError(res, err));
  });

  return router;
}

module.exports = {
  createCRUDRouter,
  createCRUDApp,
  createAuthLoginRouter: createUserLoginRouter,
};
