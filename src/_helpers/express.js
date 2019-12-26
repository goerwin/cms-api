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
  return object.replaceObjValues(query, [
    [/\{(.*)\}/, (matches) => data[matches[1]]],
  ]);
}

function createRESTRouter(mongooseDBModel, attrs = {}) {
  const {
    findItemKey = '_id',
    findItemQuery = { _id: '{_id}' },
    propsRequired = [],
    propsToTransform = [],
    propsToValidate = [],
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
          { new: true, runValidators: true }
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

function createRESTApp(dbUrl, entries, options = {}) {
  const app = express();
  const { middlewares = [], dbOptions } = options;
  const { models } = database.createDatabase(dbUrl, entries, dbOptions);

  middlewares.forEach((mw) => app.use(mw));

  return {
    app,
    items: models.reduce((acc, model, idx) => {
      const entry = entries[idx];
      const router = createRESTRouter(model, entry.restAttrs);

      app.use(entry.path, ...[...(entry.middlewares || []), router]);

      acc[entry.name] = { router, model };

      return acc;
    }, {}),
  };
}

function createAuthLoginRouter(mongooseUserModel, attrs = {}) {
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
  createRESTRouter,
  createRESTApp,
  createAuthLoginRouter,
};
