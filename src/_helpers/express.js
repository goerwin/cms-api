const express = require('express');
const bodyParser = require('body-parser');
const pick = require('lodash/pick');
const password = require('./password');
const database = require('./database');
const { requiredObjProps, validateObj } = require('./validator');

function handleError(res, err) {
  try {
    res.status(500).json(JSON.parse(err.message));
  } catch(_) {
    res.status(500).json({ message: err && err.message });
  }
}

function getTransformedObj(data, propsToTransform) {
  return Promise.all(propsToTransform.map((propToTransform) =>
    propToTransform[1] === 'hashPassword' ?
      password.createHashedPassword(data[propToTransform[0]]) :
      data[propToTransform[0]]
  ))
    .then((propsTransformed) =>
      propsTransformed.reduce((acc, propTransformed, idx) => {
        acc[propsToTransform[idx][0]] = propTransformed;
        return acc;
      }, {})
    )
    .then((transformedObj) => ({ ...data, transformedObj }));
}

function createCRUDRouter(mongooseDBModel, attrs) {
  const {
    itemKeyProperty,
    propsRequired,
    propsToTransform = [],
    propsToValidate,
    respondWithProps,
  } = attrs;

  const router = express.Router();

  router.use(bodyParser.json());

  router.get('/', (req, res) => {
    mongooseDBModel.find({})
      .then((items) =>
        res.json(items.map(item => pick(item, respondWithProps)))
      )
      .catch((err) => handleError(res, err))
  });

  router.post('/', (req, res) => {
    Promise.all([
      requiredObjProps(req.body, propsRequired),
      validateObj(req.body, propsToValidate)
    ])
      .then(([data]) => getTransformedObj(data, propsToTransform))
      .then((transformedData) =>
        new mongooseDBModel(transformedData).save())
      .then((data) => res.json(pick(data, respondWithProps)))
      .catch(err => handleError(res, err));
  });

  router.get(`/:itemId`, (req, res) => {
    mongooseDBModel.findOne({
      [itemKeyProperty]: req.params.itemId
    })
      .then((item) => res.json(pick(item, respondWithProps)))
      .catch((err) => handleError(res, err))
  });

  router.patch('/:itemId', (req, res) => {
    Promise.resolve([req.body, Object.keys(req.body)])
      .then(([data, patchProps]) => Promise.all([
        data,
        propsToTransform.filter((el) => patchProps.includes(el[0])),
        requiredObjProps(data, propsRequired.filter((el) => patchProps.includes(el))),
        validateObj(data, propsToValidate.filter((el) => patchProps.includes(el[0])))
      ]))
      .then(([data, newPropsToTransform]) => getTransformedObj(data, newPropsToTransform))
      .then((transformedData) =>
        mongooseDBModel.findOneAndUpdate(
          { [itemKeyProperty]: req.params.itemId },
          transformedData,
          { new: true }
        )
      )
      .then((item) => res.json(pick(item, respondWithProps)))
      .catch((err) => handleError(res, err))
  });

  router.delete('/:itemId', (req, res) => {
    mongooseDBModel.deleteOne({ [itemKeyProperty]: req.params.itemId })
      .then((item) => res.json(pick(item, respondWithProps)))
      .catch((err) => handleError(res, err))
  });

  return router;
}

function createCRUDApp(dbUrl, entries, options = {}) {
  const app = express();
  const { middlewares = [], dbOptions } = options;
  const { models } = database.createDatabase(dbUrl, entries, dbOptions);

  middlewares.forEach((mw) => app.use(mw));

  const routers = models.map((model, idx) => {
    const router = createCRUDRouter(model, entries[idx].crudAttrs);

    app.use(entries[idx].path, ...[...(entries[idx].middlewares || []), router]);

    return router;
  })

  return { app, routers };
}

module.exports = {
  createCRUDRouter,
  createCRUDApp
};
