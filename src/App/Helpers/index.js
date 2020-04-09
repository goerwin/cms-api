const express = require('express');
const passwordHelper = require('../_helpers/password');

function getRouter() {
    const routerEl = express.Router();

    routerEl.get('/setCookie/:name/:value', (req, res) => {
        res.cookie(req.params.name, req.params.value, {
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
            httpOnly: true,
        }).json('Done');
    });

    routerEl.get('/generatePassword/:password', (req, res) => {
        passwordHelper
            .createHashedPassword(req.params.password)
            .then((hashedPassword) =>
                res.json({ password: req.params.password, hashedPassword })
            );
    });

    return routerEl;
}

module.exports = function index() {
    return {
        helpersRouter: getRouter(),
    };
};
