const mongoose = require('mongoose');

const name = 'Tag';

const Schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

function createModel(dbConnection) {
  return dbConnection.model(name, Schema);
}

module.exports = {
  createModel,
  name
};
