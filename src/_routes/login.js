const express = require('express');
const bodyParser = require('body-parser');
const validator = require('../_helpers/validator');
const Password = require('../_helpers/password');
const User = require('../_models/User');

const ERRORS = {
  NO_USER: 'NO_USER'
};

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

  router.post('/', (req, res) => {
    validator.requiredObjProps(req.body, ['handle', 'password'])
      .then((params) => validator.validateObj(params, {
        handle: { validator: 'isLength', params: [{ min: 5 }]},
        password: { validator: 'isLength', params: [{ min: 5 }]}
      }))
      .then(({ handle, password }) =>
        Promise.all([UserModel.findOne({ username: handle }), password])
      )
      .then(([user, password]) =>
        Promise.all([Password.comparePasswords(password, user.password), user])
      )
      .then(([_, { username, email, domains }]) => ({ username, email, domains }))
      .then((user) => res.json(user))
      .catch(err => handleError(res, err));
  });

  return router;
}

module.exports = {
  createRouter
};
