require('dotenv').config({ path: './.env' });
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressHelper = require('./_helpers/express');

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

const { app } = expressHelper.createCRUDApp(
  DB_URL,
  [
    {
      path: '/api/domains',
      name: 'Domain',
      schemaDefinitions: {
        name: { type: String, required: true }
      },
      crudAttrs: {
        findItemKey: 'name',
        findItemQuery: { name: '{name}' },
        propsRequired: ['name'],
        propsToValidate: [
          ['name', 'isLength', [{ min: 5 }]],
          ['name', 'isAlphanumeric']
        ],
        respondWithProps: ['id', 'name']
      }
    },
    {
      path: '/api/users',
      name: 'User',
      schemaDefinitions: {
        domains: [{ type: 'Types.ObjectId', ref: 'Domain' }],
        name: String,
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true }
      },
      crudAttrs: {
        findItemKey: 'handle',
        findItemQuery: { $or: [{ username: '{handle}' }, { email: '{handle}' }] },
        propsRequired: ['username', 'email', 'password'],
        propsToTransform: [['password', 'hashPassword']],
        propsToValidate: [
          ['password', 'isLength', [{ min: 5 }]],
          ['email', 'isEmail'],
          ['username', 'isLength', [{ min: 5 }]],
          ['username', 'isAlphanumeric']
        ],
        respondWithProps: ['username', 'email', 'domains']
      }
    },
    // {
    //   name: 'Category',
    //   schemaDefinitions: {
    //     domain: { type: 'Types.ObjectId', ref: 'Domain' },
    //     name: { type: String, required: true, unique: true },
    //   }
    // },
    // {
    //   name: 'Posts',
    //   schemaDefinitions: {
    //     domain: { type: 'Types.ObjectId', ref: 'Domain', required: true },
    //     user: { type: 'Types.ObjectId', ref: 'User', required: true },
    //     template: { type: 'Types.ObjectId', ref: 'Template' },
    //     categories: [{ type: 'Types.ObjectId', ref: 'Category' }],
    //     tags: [{ type: 'Types.ObjectId', ref: 'Tag' }],
    //     title: { type: String, required: true },
    //     content: { type: String, required: true }
    //   }
    // },
    // {
    //   name: 'Tag',
    //   schemaDefinitions: {
    //     domain: { type: 'Types.ObjectId', ref: 'Domain' },
    //     name: { type: String, required: true, unique: true }
    //   }
    // },
    // {
    //   name: 'Template',
    //   schemaDefinitions: {
    //     domain: { type: 'Types.ObjectId', ref: 'Domain' },
    //     name: { type: String, required: true, unique: true },
    //     structure: String
    //   }
    // },
    // {
    //   name: 'Asset',
    //   schemaDefinitions: {
    //     domain: { type: 'Types.ObjectId', ref: 'Domain' },
    //     title: { type: String, required: true },
    //     path: { type: String, required: true, unique: true }
    //   }
    // }
  ],
  {
    middlewares: [
      cors({ origin: ['http://localhost:8080'] }),
      cookieParser()
    ]
  }
);

app.listen(PORT, () => {
  console.log(`Running server in port: ${PORT}`);
});
