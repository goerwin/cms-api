const express = require('express');
const bodyParser = require('body-parser');
const pick = require('lodash/pick');
const { replaceObjValues } = require('../_helpers/object');
const { createHashedPassword } = require('../_helpers/password');
const { validateObj } = require('../_helpers/validator');

function parseQuery(query, data) {
    return replaceObjValues(query, [['{id}', data.id]]);
}

function getTransformedData(data) {
    if (data.password) {
        return createHashedPassword(data.password).then((hashedPassword) => ({
            ...data,
            password: hashedPassword,
        }));
    }

    return Promise.resolve(data);
}

function createRouter(dbModel, domainModel) {
    const router = express.Router();
    const propsToReturn = '_id email username domains createdAt updatedAt';
    const propsToReturnArr = propsToReturn.split(' ');
    const query = {
        $or: [{ _id: '{id}' }, { username: '{id}' }, { email: '{id}' }],
    };
    const propsToValidate = [['password', 'isLength', [{ min: 5 }]]];

    router.use(bodyParser.json());

    router.get('/', (req, res) => {
        dbModel
            .find({})
            .select(propsToReturn)
            .then((items) => res.json(items))
            .catch((err) => res.status(400).json(err.message));
    });

    router.post('/', (req, res) => {
        validateObj(req.body, propsToValidate)
            .then((data) => getTransformedData(data))
            .then((transformedData) => new dbModel(transformedData).save())
            .then((item) => res.json(pick(item, propsToReturnArr)))
            .catch((err) => res.status(400).json(err.message));
    });

    router.get('/:id', (req, res) => {
        dbModel
            .findOne(parseQuery(query, req.params))
            .select(propsToReturn)
            .then((item) => res.json(item))
            .catch((err) => res.status(400).json(err.message));
    });

    router.patch('/:id', (req, res) => {
        const passedProps = Object.keys(req.body);
        const newPropsToValidate = propsToValidate.filter((el) =>
            passedProps.includes(el[0])
        );

        validateObj(req.body, newPropsToValidate)
            .then((data) => getTransformedData(data))
            .then((transformedData) =>
                dbModel
                    .findOneAndUpdate(
                        parseQuery(query, req.params),
                        transformedData,
                        {
                            new: true,
                            runValidators: true,
                        }
                    )
                    .select(propsToReturn)
            )
            .then((item) => res.json(item))
            .catch((err) => res.status(400).json(err.message));
    });

    router.delete('/:id', (req, res) => {
        dbModel
            .findOneAndDelete(parseQuery(query, req.params))
            .select(propsToReturn)
            .then((item) => res.json(item))
            .catch((err) => res.status(400).json(err.message));
    });

    router.get('/:id/domains', (req, res) => {
        dbModel
            .findOne(parseQuery(query, req.params))
            .then(({ domains }) =>
                domainModel
                    .find()
                    .where('_id')
                    .in(domains)
                    .exec()
            )
            .then((domains) => res.json(domains))
            .catch((err) => res.status(400).json(err.message));
    });

    return router;
}

module.exports = {
    createRouter,
};
