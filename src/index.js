require('dotenv').config({ path: './.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const database = require('./_helpers/database');
const routerHelper = require('./_helpers/router');

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

const app = express();

app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:8080'] }));

const {
  models: [
    DomainModel,
    UserModel,
    CategoryModel,
    PostModel,
    TagModel,
    TemplateModel,
    AssetModel
  ]
} = database.createDatabase(DB_URL, [
  {
    name: 'Domain',
    schemaDefinitions: {
      name: { type: String, required: true }
    }
  },
  {
    name: 'User',
    schemaDefinitions: {
      domains: [{ type: 'Types.ObjectId', ref: 'Domain' }],
      name: String,
      email: { type: String, required: true, unique: true },
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true }
    }
  },
  {
    name: 'Category',
    schemaDefinitions: {
      domain: { type: 'Types.ObjectId', ref: 'Domain' },
      name: { type: String, required: true, unique: true },
    }
  },
  {
    name: 'Posts',
    schemaDefinitions: {
      domain: { type: 'Types.ObjectId', ref: 'Domain', required: true },
      user: { type: 'Types.ObjectId', ref: 'User', required: true },
      template: { type: 'Types.ObjectId', ref: 'Template' },
      categories: [{ type: 'Types.ObjectId', ref: 'Category' }],
      tags: [{ type: 'Types.ObjectId', ref: 'Tag' }],
      title: { type: String, required: true },
      content: { type: String, required: true }
    }
  },
  {
    name: 'Tag',
    schemaDefinitions: {
      domain: { type: 'Types.ObjectId', ref: 'Domain' },
      name: { type: String, required: true, unique: true }
    }
  },
  {
    name: 'Template',
    schemaDefinitions: {
      domain: { type: 'Types.ObjectId', ref: 'Domain' },
      name: { type: String, required: true, unique: true },
      structure: String
    }
  },
  {
    name: 'Asset',
    schemaDefinitions: {
      domain: { type: 'Types.ObjectId', ref: 'Domain' },
      title: { type: String, required: true },
      path: { type: String, required: true, unique: true }
    }
  }
]);

app.use('/api/users', routerHelper.createCRUDRouter(UserModel, {
  itemKeyProperty: 'username',
  propsRequired: ['username', 'email', 'password'],
  propsToTransform: [['password', 'hashPassword']],
  propsToValidate: [
    ['password', 'isLength', [{ min: 5 }]],
    ['email', 'isEmail'],
    ['username', 'isLength', [{ min: 5 }]],
    ['username', 'isAlphanumeric']
  ],
  respondWithProps: ['username', 'email', 'domains']
}))

// app.use('/api/users', user.createRouter(UserModel));
// app.use('/api/domains', domain.createRouter(DBConnection));
// app.use('/api/login', login.createRouter(DBConnection));

app.listen(PORT, () => {
  console.log(`Running server in port: ${PORT}`);
});
