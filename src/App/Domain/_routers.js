const express = require('express');
const bodyParser = require('body-parser');
const pick = require('lodash/pick');

function createRouter(DBModel) {
  const propsToReturn = '_id name createdAt updatedAt';
  const propsToReturnArr = propsToReturn.split(' ');
  const router = express.Router();

  router.use(bodyParser.json());

  router.get('/', (req, res) => {
    DBModel.find({})
      .select(propsToReturn)
      .then((items) => res.json(items))
      .catch((err) => res.status(400).json(err.message));
  });

  router.post('/', (req, res) => {
    new DBModel(req.body)
      .save()
      .then((item) => res.json(pick(item, propsToReturnArr)))
      .catch((err) => res.status(400).json(err.message));
  });

  router.get('/:id', (req, res) => {
    DBModel.findById(req.params.id)
      .select(propsToReturn)
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  router.patch('/:id', (req, res) => {
    DBModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .select(propsToReturn)
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  router.delete('/:id', (req, res) => {
    DBModel.findByIdAndDelete(req.params.id)
      .select(propsToReturn)
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  return router;
}

module.exports = {
  createRouter,
};
