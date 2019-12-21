const express = require('express');
const bodyParser = require('body-parser');
const pick = require('lodash/pick');
const validator = require('../_helpers/validator');
const Domain = require('../_models/Domain');

function handleError(res, err) {
  try {
    res.status(500).json(JSON.parse(err.message));
  } catch(_) {
    res.status(500).json({ message: err && err.message });
  }
}

function createRouter(DBConnection) {
  const router = express.Router();
  const DomainModel = Domain.createModel(DBConnection);

  router.use(bodyParser.json());

  router.get('/', (req, res) => {
    DomainModel.find({}).select('name')
      .then((domains) => res.json(domains))
      .catch((err) => handleError(res, err))
  });

  router.post('/', (req, res) => {
    validator.requiredObjProps(req.body, ['name'])
      .then((params) => validator.validateObj(params, [
        ['name', 'isLength',[{ min: 5 }]],
        ['name', 'isAlphanumeric']
      ]))
      .then(({ name }) => new DomainModel({ name }).save())
      .then(({ name }) => res.json({ name }))
      .catch(err => handleError(res, err));
  });

  router.patch('/:domain', (req, res) => {
    Promise.resolve(req.params)
      .then(({ domain }) =>
        DomainModel.findOneAndUpdate({ name: domain }, req.body, { new: true })
      )
      .then((domain) => res.json(pick(domain, ['name'])))
      .catch((err) => handleError(res, err))
  });

  router.delete('/:domain', (req, res) => {
    DomainModel.deleteOne({ name: req.params.domain })
      .then((domain) => res.json(pick(domain, ['name'])))
      .catch((err) => handleError(res, err))
  });

  return router;
}

module.exports = {
  createRouter
};
