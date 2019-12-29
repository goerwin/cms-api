const databaseHelper = require('../_helpers/database');

module.exports = function createModel(dbConnection) {
  return databaseHelper.createModel({
    dbConnection,
    name: 'User',
    schemaDefinitions: {
      domains: [{ type: 'Types.ObjectId', ref: 'Domain' }],
      email: {
        type: String,
        required: true,
        unique: true,
        validate: { validator: 'Validator.isEmail' },
      },
      username: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        validate: { validator: 'Validator.isAlphanumeric' },
      },
      password: { type: String, required: true, minlength: 12 },
      name: String,
    },
  });
};
