const mongoose = require('mongoose');
const object = require('./object');
const validator = require('validator').default;

function createModel(attrs = {}) {
    const { schemaDefinitions, schemaIndexes = [], name, dbConnection } = attrs;
    const parsedSchemaDefs = object.replaceObjValues(schemaDefinitions, [
        ['Types.ObjectId', () => mongoose.Schema.Types.ObjectId],
        [/^Validator\.(.*)/, (matches) => validator[matches[1]]],
    ]);

    const schema = new mongoose.Schema(parsedSchemaDefs, {
        timestamps: true,
        ...attrs.options,
    });

    schemaIndexes.forEach((schemaIdx) =>
        schema.index(schemaIdx[0], schemaIdx[1])
    );

    return dbConnection.model(name, schema);
}

function createDatabase(dbUrl, entries = [], options = {}) {
    const dbConnection = mongoose.createConnection(dbUrl, {
        useFindAndModify: false,
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        ...options,
    });

    return {
        dbConnection,
        models: entries.reduce(
            (acc, entry) => ({
                ...acc,
                [entry.name]: createModel({ ...entry, dbConnection }),
            }),
            {}
        ),
    };
}

module.exports = {
    createModel,
    createDatabase,
};
