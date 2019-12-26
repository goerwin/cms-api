const mongoose = require('mongoose');
const object = require('./object');
const validator = require('validator').default;

function createDatabase(dbUrl, entries, options) {
  const dbConnection = mongoose.createConnection(dbUrl, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    ...options,
  });

  return {
    dbConnection,
    models: entries
      .map((entry) => ({
        ...entry,
        schemaDefinitions: object.replaceObjValues(entry.schemaDefinitions, [
          ['Types.ObjectId', () => mongoose.Schema.Types.ObjectId],
          [/^Validator\.(.*)/, (matches) => validator[matches[1]]],
        ]),
      }))
      .map((entry) => {
        const schema = new mongoose.Schema(entry.schemaDefinitions, {
          timestamps: true,
          ...entry.options,
        });

        (entry.schemaIndexes || []).forEach((schemaIdx) =>
          schema.index(schemaIdx[0], schemaIdx[1])
        );

        return dbConnection.model(entry.name, schema);
      }),
  };
}

module.exports = {
  createDatabase,
};
