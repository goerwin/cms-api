const mongoose = require('mongoose');

const name = 'Template';

const Schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  structure: String
}, { timestamps: true });

function createModel(dbConnection) {
  return dbConnection.model(name, Schema);
}

module.exports = {
  createModel,
  name
};
