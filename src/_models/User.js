const mongoose = require('mongoose');
const Domain = require('./Domain');

const name = 'User';

const Schema = new mongoose.Schema({
  domains: [{
    type: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true },
    ref: Domain.name
  }],
  name: String,
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

function createModel(dbConnection) {
  return dbConnection.model(name, Schema);
}

module.exports = {
  createModel,
  name
};

// TODO: PUT THIS IN YOUR FIRST POST!
// URL Structure
// - the shorter the better
// - it's bad to have the date unless you are a news publication (eg. /blog/2010/09/10/my-blogpost)
// - if doesn't hurt to categorize or split it with paths (eg. /blog/essencials/my-blogpost)
// - don't use extensions (eg. /blog/my-blogpost.html)
// - dont use more than 5 words in the slug ()

// - /blog/${postName}
// - /products/${productName}

// - /${category}/${postName}

// - components can be used to structure a page
// - categories can have subcategories
// - categories can have posts
// - posts can belong to max. 1 category
// - url of post it's determined by the category and postName
// - each category has a content structure

