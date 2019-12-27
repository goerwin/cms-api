const express = require('express');
const bodyParser = require('body-parser');

function validateUserAccessToDomain(localUser, domain) {
  return Promise.resolve(
    localUser.hasAccessToAllDomains ||
      (domain && localUser.userDomains.includes(domain))
  ).then((isValid) => {
    if (!isValid) {
      throw new Error('User has no access to this domain');
    }
  });
}

module.exports = function createRouter(dbModel) {
  const router = express.Router();

  router.use(bodyParser.json());

  router.get('/', (req, res) => {
    validateUserAccessToDomain(res.locals.user, req.query.domain)
      .then(() => (req.query.domain ? { domain: req.query.domain } : {}))
      .then((query) => dbModel.find(query))
      .then((items) => res.json(items))
      .catch((err) => res.status(400).json(err.message));
  });

  router.post('/', (req, res) => {
    validateUserAccessToDomain(res.locals.user, req.body.domain)
      .then(() => new dbModel(req.body).save())
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  router.patch('/:id', (req, res) => {
    validateUserAccessToDomain(res.locals.user, req.body.domain)
      .then(() =>
        dbModel.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        })
      )
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  router.delete('/:id', (req, res) => {
    validateUserAccessToDomain(res.locals.user, req.query.domain)
      .then(() => dbModel.findByIdAndDelete(req.params.id))
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  return router;
};
