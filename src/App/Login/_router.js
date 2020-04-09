const express = require('express');
const jwt = require('../_helpers/jwt');
const bodyParser = require('body-parser');
const pick = require('lodash/pick');
const { requiredObjProps, validateObj } = require('../_helpers/validator');
const { comparePasswords } = require('../_helpers/password');

function createRouter(userModel, domainModel, jwtSecretKey) {
    const router = express.Router();

    router.use(bodyParser.json());

    router.get('/:id/:password', (req, res) => {
        requiredObjProps(req.params, ['id', 'password'])
            .then((data) =>
                validateObj(data, [['password', 'isLength', [{ min: 5 }]]])
            )
            .then((data) =>
                Promise.all([
                    userModel.findOne({
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
            .then(([user, jwtToken]) =>
                Promise.all([
                    user,
                    jwtToken,
                    domainModel
                        .find()
                        .where('_id')
                        .in(user.domains)
                        .exec(),
                ])
            )
            .then(([user, jwtToken, domains]) => ({
                ...pick(user, ['username', 'email']),
                domains,
                jwtToken,
            }))
            .then((response) => res.json(response))
            .catch((err) => res.status(400).json(err.message));
    });

    return router;
}

module.exports = createRouter;
