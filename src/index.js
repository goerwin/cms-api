require('dotenv').config({ path: './.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const user = require('./_routes/user');
const domain = require('./_routes/domain');
const login = require('./_routes/login');

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

const app = express();

const DBConnection = mongoose.createConnection(DB_URL, {
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

app.use(cookieParser());

app.use(cors({ origin: ['http://localhost:8080'] }));

app.use('/api/users', user.createRouter(DBConnection));
app.use('/api/domains', domain.createRouter(DBConnection));
app.use('/api/login', login.createRouter(DBConnection));

app.listen(PORT, () => {
  console.log(`Running server in port: ${PORT}`);
});
