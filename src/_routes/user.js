const express = require('express');
const bodyParser = require('body-parser');
const Password = require('../_helpers/password');
const User = require('../_models/User');

const ERRORS = {
  MISSING_PARAMS: 'MISSING_PARAMS',
  MISSING_USERNAME: 'MISSING_USERNAME',
}

const bodyParserJson = bodyParser.json();

function handleError(res, err) {
  res.status(500).json({ message: err && err.message });
}

function createRouter(DBConnection) {
  const router = express.Router();
  const UserModel = User.createModel(DBConnection);

  router.get('/', (req, res) => {
    UserModel.find()
      .then((users) => res.json(users))
      .catch((err) => handleError(res, err))
  });

  router.post('/', bodyParserJson, (req, res) => {
    Promise.resolve(req.body)
      .then(({ username, email, password }) => {
        if (username && email && password) return { username, email, password };
        throw new Error(ERRORS.MISSING_PARAMS);
      })
      .then(({ username, email, password }) =>
        Promise.all([username, email, Password.createHashedPassword(password)])
      )
      .then(([username, email, hashedPassword]) =>
        new UserModel({ username, email, password: hashedPassword }).save()
      )
      .then((newUser) => res.json(newUser))
      .catch(err => handleError(res, err));
  });

  router.delete('/', bodyParserJson, (req, res) => {
    Promise.resolve(req.body)
      .then(({ username }) => {
        if (username) return username;
        throw new Error(ERRORS.MISSING_USERNAME);
      })
      .then((username) => UserModel.deleteOne({ username }))
      .then(() => res.json())
      .catch(err => handleError(res, err));
  });

  router.patch('/', (req, res) => {

  });

  return router;
}

module.exports = {
  createRouter
};
