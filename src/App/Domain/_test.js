const express = require('express');
const mongoose = require('mongoose');
const assert = require('assert');
const router = require('./_router');
const model = require('./_model');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Domain', () => {
  let dbConnection;
  let app;

  beforeEach(() => {
    const mongoServer = new MongoMemoryServer();

    return mongoServer.getUri(true).then((mongoUri) => {
      dbConnection = mongoose.createConnection(mongoUri, {
        useFindAndModify: false,
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });

      const dbModel = model(dbConnection);
      const domainRouter = router(dbModel);

      app = express();
      app.use(domainRouter);
    });
  });

  afterEach(() => {
    return dbConnection.close();
  });

  describe('GET', () => {
    it('should return a 200 and content-type json', (done) => {
      supertest(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(() => done());
    });
    it('should return an empty array', (done) => {
      supertest(app)
        .get('/')
        .then((response) => {
          assert.deepStrictEqual(response.body, []);
        })
        .then(() => done());
    });

    it('should return an array with 2 items inserted', (done) => {
      supertest(app)
        .post('/')
        .send({ name: 'ohmama' })
        .then(() => {
          supertest(app)
            .post('/')
            .send({ name: 'ohmama2' })
            .then(() => {
              supertest(app)
                .get('/')
                .then((response) => {
                  assert.deepStrictEqual(response.body.length, 2);
                })
                .then(() => done());
            });
        });
    });
  });

  describe('POST', () => {
    it('should return a 200 and content-type json', (done) => {
      supertest(app)
        .post('/')
        .send({ name: 'ohmama' })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(() => done());
    });

    it('should create an entry in the database', (done) => {
      supertest(app)
        .post('/')
        .send({ name: 'ohmama' })
        .then((response) => {
          assert.deepStrictEqual(response.body.name, 'ohmama');
          assert.strictEqual(typeof response.body._id, 'string');
          assert.strictEqual(typeof response.body.createdAt, 'string');
          assert.strictEqual(typeof response.body.updatedAt, 'string');
        })
        .then(() => done());
    });
  });
});
