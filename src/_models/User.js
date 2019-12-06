const mongoose = require('mongoose');

const name = 'User';

const Schema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

function createModel(dbConnection) {
  return dbConnection.model(name, Schema);
}

module.exports = {
  createModel
}
