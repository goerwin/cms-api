const express = require('express');
const bodyParser = require('body-parser');
const Category = require('../_models/Category');

const ERRORS = {
  MISSING_PARAMS: 'MISSING_PARAMS'
};

function handleError(res, err) {
  res.status(500).json({ message: err && err.message });
}

function createRouter(DBConnection) {
  const router = express.Router();
  const UserModel = User.createModel(DBConnection);

  router.use(bodyParser.json());

  router.get('/', (req, res) => {
    Category.find({})
      .then((categories) => res.json(categories))
      .catch((err) => handleError(res, err))
  });

  router.post('/', (req, res) => {
    Promise.resolve(req.body)
      .then(({ name, template }) => {
        if (name && template) return { name, template };
        throw new Error(ERRORS.MISSING_PARAMS);
      })
      .then((params) => new UserModel(params).save())
      .then((params) => res.json(params))
      .catch(err => handleError(res, err));
  });

  router.get('/:id', (req, res) => {
    Promise.resolve(req.params)
      .then(({ id }) => UserModel.findById(id))
      .then((user) => res.json(user))
      .catch((err) => handleError(res, err))
  });

  router.patch('/:id', (req, res) => {
    Promise.resolve(req.params)
      .then(({ id }) => UserModel.findByIdAndUpdate(id, req.body, { new: true }))
      .then((user) => res.json(user))
      .catch((err) => handleError(res, err))
  });

  router.delete('/:id', (req, res) => {
    UserModel.deleteOne({ id: req.params.id })
      .then((user) => res.json(user))
      .catch((err) => handleError(res, err))
  });

  return router;
}

module.exports = {
  createRouter
};
