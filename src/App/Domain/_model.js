const databaseHelper = require('../_helpers/database');

module.exports = function createModel(dbConnection) {
    return databaseHelper.createModel({
        dbConnection,
        name: 'Domain',
        schemaDefinitions: {
            name: {
                type: String,
                required: true,
                unique: true,
                minlength: 5,
                validate: { validator: 'Validator.isAlphanumeric' },
            },
        },
    });
};
