const express = require('express');
const bodyParser = require('body-parser');
const pick = require('lodash/pick');
const Password = require('../_helpers/password');
const validator = require('../_helpers/validator');
// const User = require('../_models/User');

function handleError(res, err) {
  try {
    res.status(500).json(JSON.parse(err.message));
  } catch(_) {
    res.status(500).json({ message: err && err.message });
  }
}

function createRouter(UserModel) {
  const router = express.Router();

  router.use(bodyParser.json());

  router.get('/', (req, res) => {
    UserModel.find({})
      .then((users) =>
        res.json(users.map(user => pick(user, ['username', 'email', 'domains'])))
      )
      .catch((err) => handleError(res, err))
  });

  router.post('/', (req, res) => {
    validator.requiredObjProps(req.body, ['username', 'email', 'password'])
      .then((params) => validator.validateObj(params, [
        ['password', 'isLength', [{ min: 5 }]],
        ['email', 'isEmail'],
        ['username', 'isLength', [{ min: 5 }]],
        ['username', 'isAlphanumeric']
      ]))
      .then(({ username, email, password }) =>
        Promise.all([username, email, Password.createHashedPassword(password)])
      )
      .then(([username, email, hashedPassword]) =>
        new UserModel({ username, email, password: hashedPassword }).save()
      )
      .then(({ username, email }) => res.json({ username, email }))
      .catch(err => handleError(res, err));
  });

  router.get('/:username', (req, res) => {
    Promise.resolve(req.params)
      .then(({ username }) => UserModel.findOne({ username }))
      .then((user) => res.json(pick(user, ['username', 'email'])))
      .catch((err) => handleError(res, err))
  });

  router.patch('/:username', (req, res) => {
    Promise.resolve(req.params)
      .then(({ username }) =>
        UserModel.findOneAndUpdate({ username }, req.body, { new: true })
      )
      .then((user) => res.json(pick(user, ['username', 'email'])))
      .catch((err) => handleError(res, err))
  });

  router.delete('/:username', (req, res) => {
    UserModel.deleteOne({ username: req.params.username })
      .then((user) => res.json(pick(user, ['username', 'email'])))
      .catch((err) => handleError(res, err))
  });

  return router;
}

module.exports = {
  createRouter
};
