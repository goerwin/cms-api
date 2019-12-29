const assert = require('assert');
const { createApp } = require('../../App');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { supertestSeries } = require('./_helpers');

describe('App', () => {
  describe('GET', () => {
    let app;

    beforeEach(() => {
      return new MongoMemoryServer()
        .getUri(true)
        .then((mongoUri) =>
          createApp({
            secretDBUrl: mongoUri,
            secretJwtKey: 'aRandomSecretJwtKey',
            secretAdminKey: 'aRandomSecretAdminKey',
          })
        )
        .then((createdApp) => (app = createdApp));
    });

    describe.each`
      name         | apiUrl
      ${'Domains'} | ${'/api/domains'}
      ${'Users'}   | ${'/api/users'}
    `('$name', ({ apiUrl }) => {
      it('should return a 401 if no cookie adminKey', (done) => {
        supertest(app)
          .get(apiUrl)
          .expect(401)
          .then(() => done());
      });

      it('should return a 401 when wrong cookie adminKey', (done) => {
        supertest
          .agent(app)
          .get(apiUrl)
          .set('Cookie', ['adminKey=aBADRandomSecretAdminKey;'])
          .expect(401)
          .then(() => done());
      });

      it('should return a 200 when correct cookie adminKey', (done) => {
        supertest
          .agent(app)
          .get(apiUrl)
          .set('Cookie', ['adminKey=aRandomSecretAdminKey;'])
          .expect(200)
          .then(() => done());
      });

      it('should return an empty array of items', (done) => {
        supertest
          .agent(app)
          .get(apiUrl)
          .set('Cookie', ['adminKey=aRandomSecretAdminKey;'])
          .then((results) => {
            assert.deepStrictEqual(results.body, []);
          })
          .then(() => done());
      });
    });

    describe('With Cookie AdminKey', () => {
      let withCookie;

      beforeEach(() => {
        withCookie = supertest
          .agent(app)
          .set('Cookie', ['adminKey=aRandomSecretAdminKey;']);
      });

      describe.each([
        { name: 'shor' },
        { name: 'has space' },
        { name: 'has-dash' },
        { name: 'has$pecialChars' },
      ])('Bad Domain items', (item) => {
        it(`should fail to post domain with bad item: ${JSON.stringify(
          item
        )}`, (done) => {
          withCookie
            .post('/api/domains')
            .send(item)
            .expect(400)
            .then(() => done());
        });
      });

      describe.each([
        { username: 'shor', email: 'a1@gmail.com', password: '12345' },
        { username: 'has space', email: 'a1@gmail.com', password: '12345' },
        { username: 'has-dash', email: 'a1@gmail.com', password: '12345' },
        { username: 'has$€', email: 'a1@gmail.com', password: '12345' },
        { username: 'bademail', email: 'gmail.com', password: '12345' },
        { username: 'badpassword', email: 'a1@gmail.com', password: '1234' },
      ])('Bad User items', (item) => {
        it(`should fail to post user with bad item: ${JSON.stringify(
          item
        )}`, (done) => {
          withCookie
            .post('/api/users')
            .send(item)
            .expect(400)
            .then(() => done());
        });
      });

      it('should post a domain and return expected items', (done) => {
        withCookie
          .post('/api/domains')
          .send({ name: 'name1' })
          .expect(200)
          .then((results) => {
            assert.strictEqual(results.body.name, 'name1');
            assert.strictEqual(
              ['_id', 'name', 'createdAt', 'updatedAt'].every((el) =>
                Object.keys(results.body).includes(el)
              ),
              true
            );
          })
          .then(() => done());
      });

      it('should post a user and return expected items', (done) => {
        withCookie
          .post('/api/users')
          .send({ username: 'name1', email: 'a1@a1.com', password: '12345' })
          .expect(200)
          .then((results) => {
            assert.strictEqual(results.body.username, 'name1');
            assert.strictEqual(results.body.email, 'a1@a1.com');
            assert.deepStrictEqual(results.body.domains, []);
            assert.strictEqual(
              ['username', 'email', 'domains', 'createdAt', 'updatedAt'].every((el) =>
                Object.keys(results.body).includes(el)
              ),
              true
            );
            assert.strictEqual(
              Object.keys(results.body).includes('password'),
              false
            );
          })
          .then(() => done());
      });

      describe('with 2 domains', () => {
        beforeEach(() => {
          return supertestSeries([
            () => withCookie.post('/api/domains').send({ name: 'ohmama' }),
            () => withCookie.post('/api/domains').send({ name: 'ohmama2' }),
          ]);
        });

        it('should return 2 domains', (done) => {
          withCookie
            .get('/api/domains')
            .then((results) => {
              assert.deepStrictEqual(results.body.length, 2);
              assert.deepStrictEqual(results.body[0].name, 'ohmama');
              assert.deepStrictEqual(results.body[1].name, 'ohmama2');
            })
            .then(() => done());
        });
      });

      // it('should post 2 users and return them', (done) => {
      //   withCookie
      //     .get('/api/domains')
      //     .then((results) => {
      //       assert.deepStrictEqual(results.body.length, 2);
      //       assert.deepStrictEqual(results.body[0].name, 'ohmama');
      //       assert.deepStrictEqual(results.body[1].name, 'ohmama2');
      //     })
      //     .then(() => done());
      // });
    });
  });
});
