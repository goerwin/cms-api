const express = require('express');
const jwt = require('../_helpers/jwt');
const bodyParser = require('body-parser');
const pick = require('lodash/pick');
const { requiredObjProps, validateObj } = require('../_helpers/validator');
const { comparePasswords } = require('../_helpers/password');

function createRouter(UserModel, jwtSecretKey) {
  const router = express.Router();

  router.use(bodyParser.json());

  router.post('/', bodyParser.json(), (req, res) => {
    requiredObjProps(req.body, ['id', 'password'])
      .then((data) =>
        validateObj(data, [['password', 'isLength', [{ min: 5 }]]])
      )
      .then((data) =>
        Promise.all([
          UserModel.findOne({
            $or: [{ username: data.id }, { email: data.id }],
          }),
          data.password,
        ])
      )
      .then(([user, password]) =>
        Promise.all([comparePasswords(password, user.password), user])
      )
      .then(([, user]) =>
        Promise.all([
          user,
          jwt.generateToken({ userId: user._id }, jwtSecretKey),
        ])
      )
      .then(([user, token]) => {
        res.json({
          ...pick(user, ['username', 'email', 'domains']),
          jwtToken: token,
        });
      })
      .catch((err) => res.status(400).json(err.message));
  });

  return router;
}

module.exports = createRouter;
