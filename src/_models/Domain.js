const mongoose = require('mongoose');

const name = 'Domain';

const Schema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true });

function createModel(dbConnection) {
  return dbConnection.model(name, Schema);
}

module.exports = {
  createModel,
  name
};
