const mongoose = require('mongoose');
const Template = require('./Template');

const name = 'Category';

const Schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: Template.name, required: true }
}, { timestamps: true });

function createModel(dbConnection) {
  return dbConnection.model(name, Schema);
}

module.exports = {
  createModel,
  name
};
