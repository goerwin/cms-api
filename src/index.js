require('dotenv').config({ path: './.env' });
const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const databaseHelper = require('./_helpers/database');
const loginMiddlewares = require('./_middlewares/login');
const User = require('./User');
const Domain = require('./Domain');
const Category = require('./Category');
const Tag = require('./Tag');
const Template = require('./Template');
const Asset = require('./Asset');
const Post = require('./Post');
const loginRouter = require('./_routers/login');

const PORT = process.env.PORT || 3000;

const { SECRET_DB_URL, SECRET_JWT_KEY } = process.env;

const app = express();

const { dbConnection } = databaseHelper.createDatabase(SECRET_DB_URL);

const { domainModel, domainRouter } = Domain(dbConnection);
const { userModel, userRouter } = User(dbConnection, domainModel);
const { categoryRouter } = Category(dbConnection);
const { tagRouter } = Tag(dbConnection);
const { templateRouter } = Template(dbConnection);
const { assetRouter } = Asset(dbConnection);
const { postRouter } = Post(dbConnection);

const verifyUserLoginMw = loginMiddlewares.verifyUserLogin(
  userModel,
  domainModel,
  SECRET_JWT_KEY
);

app.use(
  cookieParser(),
  cors({
    origin: ['http://localhost:8080'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);

app.use('/api/users', userRouter);
app.use('/api/domains', domainRouter);
app.use('/api/categories', verifyUserLoginMw, categoryRouter);
app.use('/api/tags', verifyUserLoginMw, tagRouter);
app.use('/api/templates', verifyUserLoginMw, templateRouter);
app.use('/api/assets', verifyUserLoginMw, assetRouter);
app.use('/api/posts', verifyUserLoginMw, postRouter);
app.use('/api/login', loginRouter(userModel, SECRET_JWT_KEY));

// eslint-disable-next-line
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Running server in port: ${PORT}`);
});
