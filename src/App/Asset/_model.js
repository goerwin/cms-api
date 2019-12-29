const databaseHelper = require('../_helpers/database');

module.exports = function createModel(dbConnection) {
  return databaseHelper.createModel({
    dbConnection,
    name: 'Asset',
    schemaDefinitions: {
      domain: { type: 'Types.ObjectId', ref: 'Domain' },
      name: {
        type: String,
        required: true,
        validate: { validator: 'Validator.isAlphanumeric' },
      },
      path: { type: String, required: true, unique: true },
    },
    schemaIndexes: [[{ name: 1, domain: 1 }, { unique: true }]],
  });
};
