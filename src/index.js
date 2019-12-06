const express = require('express');
const mongoose = require('mongoose');
const user = require('./_routes/user');
const SECRETS = require('../_secrets');

const app = express();
const PORT = 3000;

const DBConnection = mongoose.createConnection(SECRETS.DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

app.use('/api/users', user.createRouter(DBConnection));

app.listen(PORT, () => {
  console.log(`Running server in port: ${PORT}`);
});
