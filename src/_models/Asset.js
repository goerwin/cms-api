const mongoose = require('mongoose');
const Domain = require('./Domain');

const name = 'Asset';

const Schema = new mongoose.Schema({
  domain: { type: mongoose.Schema.Types.ObjectId, ref: Domain.name },
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
