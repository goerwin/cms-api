const databaseHelper = require('../_helpers/database');

module.exports = function createModel(dbConnection) {
    return databaseHelper.createModel({
        dbConnection,
        name: 'Post',
        schemaDefinitions: {
            domain: { type: 'Types.ObjectId', ref: 'Domain', required: true },
            user: { type: 'Types.ObjectId', ref: 'User', required: true },
            template: { type: 'Types.ObjectId', ref: 'Template' },
            categories: [{ type: 'Types.ObjectId', ref: 'Category' }],
            tags: [{ type: 'Types.ObjectId', ref: 'Tag' }],
            title: { type: String, required: true },
            content: { type: String, required: true },
        },
    });
};
