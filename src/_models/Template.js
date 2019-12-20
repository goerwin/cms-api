const mongoose = require('mongoose');
const Domain = require('./Domain');

const name = 'Template';

const Schema = new mongoose.Schema({
  domain: { type: mongoose.Schema.Types.ObjectId, ref: Domain.name },
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
