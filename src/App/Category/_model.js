const databaseHelper = require('../_helpers/database');
const helpers = require('./_helpers');

module.exports = function createModel(dbConnection) {
    return databaseHelper.createModel({
        dbConnection,
        name: 'Category',
        schemaDefinitions: {
            domain: { type: 'Types.ObjectId', ref: 'Domain' },
            name: {
                type: String,
                required: true,
                validate: { validator: helpers.validateCategory },
            },
        },
        schemaIndexes: [[{ name: 1, domain: 1 }, { unique: true }]],
    });
};
