const mongoose = require('mongoose');
const Category = require('./Category');
const Template = require('./Template');
const Tag = require('./Tag');

const name = 'Post';

const Schema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: Category.name }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: Tag.name }],
  template: { type: mongoose.Schema.Types.ObjectId, ref: Template.name }
}, { timestamps: true });

function createModel(dbConnection) {
  return dbConnection.model(name, Schema);
}

module.exports = {
  createModel,
  name
};
