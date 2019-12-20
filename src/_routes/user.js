const express = require('express');
const bodyParser = require('body-parser');
const Password = require('../_helpers/password');
const validator = require('../_helpers/validator');
const User = require('../_models/User');

function handleError(res, err) {
  try {
    res.status(500).json(JSON.parse(err.message));
  } catch(_) {
    res.status(500).json({ message: err && err.message });
  }
}

function createRouter(DBConnection) {
  const router = express.Router();
  const UserModel = User.createModel(DBConnection);

  router.use(bodyParser.json());

  router.get('/', (req, res) => {
    UserModel.find({}).select('username email')
      .then((users) => res.json(users))
      .catch((err) => handleError(res, err))
  });

  router.post('/', (req, res) => {
    validator.requiredObjProps(req.body, ['username', 'email', 'password'])
      .then((params) => validator.validateObj(params, {
        password: { validator: 'isLength', params: [{ min: 5 }] },
        email: { validator: 'isEmail' },
        username: { validator: 'isLength', params: [{ min: 5 }]}
      }))
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
      .then(({ username }) => UserModel.findOne({ username }).select('username email'))
      .then((user) => res.json(user))
      .catch((err) => handleError(res, err))
  });

  router.patch('/:username', (req, res) => {
    Promise.resolve(req.params)
      .then(({ username }) =>
        UserModel.findOneAndUpdate({ username }, req.body, { new: true }).select('username email')
      )
      .then((user) => res.json(user))
      .catch((err) => handleError(res, err))
  });

  router.delete('/:username', (req, res) => {
    UserModel.deleteOne({ username: req.params.username }).select('username email')
      .then((user) => res.json(user))
      .catch((err) => handleError(res, err))
  });

  return router;
}

module.exports = {
  createRouter
};
