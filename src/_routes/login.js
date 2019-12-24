const express = require('express');
const bodyParser = require('body-parser');
const validator = require('../_helpers/validator');
const Password = require('../_helpers/password');

function handleError(res, err) {
  try {
    res.status(500).json(JSON.parse(err.message));
  } catch (_) {
    res.status(500).json({ message: err && err.message });
  }

  return true;
}

function createRouter(UserModel) {
  const router = express.Router();

  router.use(bodyParser.json());

  router.post('/', (req, res) => {
    validator
      .requiredObjProps(req.body, ['handle', 'password'])
      .then((params) =>
        validator.validateObj(params, {
          handle: { validator: 'isLength', params: [{ min: 5 }] },
          password: { validator: 'isLength', params: [{ min: 5 }] },
        })
      )
      .then(({ handle, password }) =>
        Promise.all([UserModel.findOne({ username: handle }), password])
      )
      .then(([user, password]) =>
        Promise.all([Password.comparePasswords(password, user.password), user])
      )
      .then(([, { username, email, domains }]) => ({
        username,
        email,
        domains,
      }))
      .then((user) => res.json(user))
      .catch((err) => handleError(res, err));
  });

  return router;
}

module.exports = {
  createRouter,
};
