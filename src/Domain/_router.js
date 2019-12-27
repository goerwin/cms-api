const express = require('express');
const bodyParser = require('body-parser');

module.exports = function createRouter(DBModel) {
  const router = express.Router();

  router.use(bodyParser.json());

  router.get('/', (req, res) => {
    DBModel.find({})
      .then((items) => res.json(items))
      .catch((err) => res.status(400).json(err.message));
  });

  router.post('/', (req, res) => {
    new DBModel(req.body)
      .save()
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  router.get('/:id', (req, res) => {
    DBModel.findById(req.params.id)
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  router.patch('/:id', (req, res) => {
    DBModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  router.delete('/:id', (req, res) => {
    DBModel.findByIdAndDelete(req.params.id)
      .then((item) => res.json(item))
      .catch((err) => res.status(400).json(err.message));
  });

  return router;
};
