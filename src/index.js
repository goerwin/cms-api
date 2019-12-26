require('dotenv').config({ path: './.env' });
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressHelper = require('./_helpers/express');

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

const { app, items } = expressHelper.createRESTApp(
  DB_URL,
  [
    {
      path: '/api/domains',
      name: 'Domain',
      schemaDefinitions: {
        name: {
          type: String,
          required: true,
          minlength: 5,
          validate: { validator: 'Validator.isAlphanumeric' },
        },
      },
      restAttrs: {
        findItemKey: 'name',
        findItemQuery: { name: '{name}' },
      },
    },
    {
      path: '/api/users',
      name: 'User',
      schemaDefinitions: {
        domains: [{ type: 'Types.ObjectId', ref: 'Domain' }],
        name: String,
        email: {
          type: String,
          required: true,
          unique: true,
          validate: { validator: 'Validator.isEmail' },
        },
        username: {
          type: String,
          required: true,
          unique: true,
          minlength: 5,
          validate: { validator: 'Validator.isAlphanumeric' },
        },
        password: { type: String, required: true, minlength: 12 },
      },
      restAttrs: {
        findItemKey: 'handle',
        findItemQuery: {
          $or: [{ username: '{handle}' }, { email: '{handle}' }],
        },
        respondWithProps: ['username', 'email', 'domains'],
        propsToTransform: [['password', 'hashPassword']],
        propsToValidate: [
          ['password', 'isLength', [{ min: 5 }]],
        ],
      },
    },
    {
      path: '/api/categories',
      name: 'Category',
      schemaDefinitions: {
        domain: { type: 'Types.ObjectId', ref: 'Domain', required: true },
        name: {
          type: String,
          required: true,
          validate: { validator: 'Validator.isAlphanumeric' },
        },
      },
      schemaIndexes: [[{ name: 1, domain: 1 }, { unique: true }]],
    },
    {
      path: '/api/tags',
      name: 'Tag',
      schemaDefinitions: {
        domain: { type: 'Types.ObjectId', ref: 'Domain' },
        name: {
          type: String,
          required: true,
          validate: { validator: 'Validator.isAlphanumeric' },
        },
      },
      schemaIndexes: [[{ name: 1, domain: 1 }, { unique: true }]],
    },
    {
      path: '/api/templates',
      name: 'Template',
      schemaDefinitions: {
        domain: { type: 'Types.ObjectId', ref: 'Domain' },
        name: {
          type: String,
          required: true,
          validate: { validator: 'Validator.isAlphanumeric' },
        },
        structure: String,
      },
      schemaIndexes: [[{ name: 1, domain: 1 }, { unique: true }]],
    },
    {
      path: '/api/assets',
      name: 'Asset',
      schemaDefinitions: {
        domain: { type: 'Types.ObjectId', ref: 'Domain' },
        name: {
          type: String,
          required: true,
          validate: { validator: 'Validator.isAlphanumeric' },
        },
        path: { type: String, required: true, unique: true },
      },
      schemaIndexes: [[{ name: 1, domain: 1 }, { unique: true }]],
    },
    {
      path: '/api/posts',
      name: 'Post',
      schemaDefinitions: {
        domain: { type: 'Types.ObjectId', ref: 'Domain', required: true },
        user: { type: 'Types.ObjectId', ref: 'User', required: true },
        template: { type: 'Types.ObjectId', ref: 'Template' },
        categories: [{ type: 'Types.ObjectId', ref: 'Category' }],
        tags: [{ type: 'Types.ObjectId', ref: 'Tag' }],
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    },
  ],
  {
    middlewares: [cors({ origin: ['http://localhost:8080'] }), cookieParser()],
  }
);

items['User'].router.get('/domainsByUser/:username', (req, res) => {
  const DomainModel = items['Domain'].model;
  const UserModel = items['User'].model;

  req.params.username;

  UserModel.findOne({ username: req.params.username })
    .then(({ domains }) =>
      DomainModel.find()
        .where('_id')
        .in(domains)
        .exec()
    )
    .then((result) => {
      res.json(result);
    });
});

app.listen(PORT, () => {
  console.log(`Running server in port: ${PORT}`);
});
