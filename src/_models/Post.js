const mongoose = require('mongoose');
const Category = require('./Category');
const Template = require('./Template');
const Tag = require('./Tag');
const User = require('./User');
const Domain = require('./Domain');

const name = 'Post';

const Schema = new mongoose.Schema({
  domain: { type: mongoose.Schema.Types.ObjectId, ref: Domain.name, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: Template.name },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: Category.name }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: Tag.name }],
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

function createModel(dbConnection) {
  return dbConnection.model(name, Schema);
}

module.exports = {
  createModel,
  name
};
