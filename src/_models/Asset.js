const mongoose = require('mongoose');

const name = 'Asset';

const Schema = new mongoose.Schema({
  title: { type: String, required: true },
  path: { type: String, required: true, unique: true }
}, { timestamps: true });

function createModel(dbConnection) {
  return dbConnection.model(name, Schema);
}

module.exports = {
  createModel,
  name
};
