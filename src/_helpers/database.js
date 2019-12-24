const mongoose = require('mongoose');
const object = require('./object');

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
          ['Types.ObjectId', mongoose.Schema.Types.ObjectId],
        ]),
      }))
      .map((entry) =>
        dbConnection.model(
          entry.name,
          new mongoose.Schema(entry.schemaDefinitions, {
            timestamps: true,
            ...entry.options,
          })
        )
      ),
  };
}

module.exports = {
  createDatabase,
};
