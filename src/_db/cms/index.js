const mongoose = require('mongoose');




module.exports.createConnection = (dbUrl) => {
  const dbConnection = mongoose.createConnection(DB_URL, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  });

  return {
    dbConnection
  }
}
