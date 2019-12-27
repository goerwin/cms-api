const express = require('express');
const bodyParser = require('body-parser');
const pick = require('lodash/pick');
const { createHashedPassword } = require('./password');
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
        ? createHashedPassword(data[propToTransform[0]])
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

function createRESTRouter(attrs = {}) {
  const {
    mongooseDBModel,
    findItemKey = '_id',
    findItemQuery = { _id: '{_id}' },
    propsRequired = [],
    propsToTransform = [],
    propsToValidate = [],
    respondWithProps,
    getMiddlewares = [],
    postMiddlewares = [],
    getItemMiddlewares = [],
    patchItemMiddlewares = [],
    deleteItemMiddlewares = [],
  } = attrs;

  const router = express.Router();

  router.use(bodyParser.json());

  router.get('/', ...getMiddlewares, (req, res) => {
    mongooseDBModel
      .find({})
      .then((items) =>
        res.json(
          items.map((item) =>
            respondWithProps ? pick(item, respondWithProps) : item
          )
        )
      )
      .catch((err) => handleError(res, err));
  });

  router.post('/', ...postMiddlewares, (req, res) => {
    Promise.all([
      requiredObjProps(req.body, propsRequired),
      validateObj(req.body, propsToValidate),
    ])
      .then(([data]) => getTransformedObj(data, propsToTransform))
      .then((transformedData) => new mongooseDBModel(transformedData).save())
      .then((data) =>
        res.json(respondWithProps ? pick(data, respondWithProps) : data)
      )
      .catch((err) => handleError(res, err));
  });

  router.get(`/:${findItemKey}`, ...getItemMiddlewares, (req, res) => {
    mongooseDBModel
      .findOne(parseQuery(findItemQuery, req.params))
      .then((item) =>
        res.json(respondWithProps ? pick(item, respondWithProps) : item)
      )
      .catch((err) => handleError(res, err));
  });

  router.patch(`/:${findItemKey}`, ...patchItemMiddlewares, (req, res) => {
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
      .then((item) =>
        res.json(respondWithProps ? pick(item, respondWithProps) : item)
      )
      .catch((err) => handleError(res, err));
  });

  router.delete(`/:${findItemKey}`, ...deleteItemMiddlewares, (req, res) => {
    mongooseDBModel
      .deleteOne(parseQuery(findItemQuery, req.params))
      .then((item) =>
        res.json(respondWithProps ? pick(item, respondWithProps) : item)
      )
      .catch((err) => handleError(res, err));
  });

  return router;
}

function createRESTRouters(defs) {
  return defs.reduce((acc, def) => {
    acc[def.mongooseDBModel.modelName] = createRESTRouter(def);

    return acc;
  }, {});
}

module.exports = {
  createRESTRouter,
  createRESTRouters,
};
