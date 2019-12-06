require('dotenv').config({ path: './.env' });

const express = require('express');
const mongoose = require('mongoose');
const user = require('./_routes/user');

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

const app = express();

const DBConnection = mongoose.createConnection(DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

app.use('/api/users', user.createRouter(DBConnection));

app.listen(PORT, () => {
  console.log(`Running server in port: ${PORT}`);
});
