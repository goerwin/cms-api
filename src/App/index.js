const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const databaseHelper = require('./_helpers/database');
const adminMiddlewares = require('./_middlewares/admin');
const User = require('./User');
const Domain = require('./Domain');
const Category = require('./Category');
const Tag = require('./Tag');
const Template = require('./Template');
const Asset = require('./Asset');
const Post = require('./Post');
const Login = require('./Login');
const Helpers = require('./Helpers');
const Tools = require('./Tools');

function createApp({ secretDBUrl, secretJwtKey, secretAdminKey }) {
    const app = express();

    const { dbConnection } = databaseHelper.createDatabase(secretDBUrl);

    const { domainModel, domainRouter } = Domain(dbConnection);
    const { userModel, userRouter } = User(dbConnection, domainModel);
    const { categoryModel, categoryRouter } = Category(dbConnection);
    const { tagModel, tagRouter } = Tag(dbConnection);
    const { templateModel, templateRouter } = Template(dbConnection);
    const { assetModel, assetRouter } = Asset(dbConnection);
    const { postModel, postRouter } = Post(dbConnection);

    const { toolsRouter } = Tools({
        userModel,
        domainModel,
        categoryModel,
        tagModel,
        templateModel,
        assetModel,
        postModel,
    });

    const { helpersRouter } = Helpers(secretJwtKey);

    const { loginRouter, loginMiddlewares } = Login(
        userModel,
        domainModel,
        secretJwtKey
    );

    const verifyUserLoginMw = loginMiddlewares.verifyUserLogin(
        userModel,
        domainModel,
        secretJwtKey
    );

    app.use(
        cookieParser(),
        cors({
            origin: ['http://localhost:8080'],
            credentials: true,
            allowedHeaders: ['Authorization', 'Content-Type'],
        })
    );

    const verifyAdminMw = adminMiddlewares.verifyAdmin(secretAdminKey);

    app.use('/api/users', verifyAdminMw, userRouter);
    app.use('/api/domains', verifyAdminMw, domainRouter);
    app.use('/api/tools', verifyAdminMw, toolsRouter);

    app.use('/api/categories', verifyUserLoginMw, categoryRouter);
    app.use('/api/tags', verifyUserLoginMw, tagRouter);
    app.use('/api/templates', verifyUserLoginMw, templateRouter);
    app.use('/api/assets', verifyUserLoginMw, assetRouter);
    app.use('/api/posts', verifyUserLoginMw, postRouter);
    app.use('/api/login', loginRouter);
    app.use('/api/helpers', helpersRouter);

    // eslint-disable-next-line
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ message: 'Something broke!' });
    });

    return app;
}

module.exports = {
    createApp,
};
