const assert = require('assert');
const { createApp } = require('../../App');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { supertestSeries } = require('./_helpers');

describe('App', () => {
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
  `('Domains/Users', ({ name, apiUrl }) => {
    it(`should return a 401 if no cookie adminKey in ${name} GET`, (done) => {
      supertest(app)
        .get(apiUrl)
        .expect(401)
        .then(() => done());
    });

    it(`should return a 401 when wrong cookie adminKey in ${name} GET`, (done) => {
      supertest
        .agent(app)
        .get(apiUrl)
        .set('Cookie', ['adminKey=aBADRandomSecretAdminKey;'])
        .expect(401)
        .then(() => done());
    });
  });

  describe('With Cookie AdminKey', () => {
    let withAdminCookieRequest;

    beforeEach(() => {
      withAdminCookieRequest = supertest
        .agent(app)
        .set('Cookie', ['adminKey=aRandomSecretAdminKey;']);
    });

    describe.each`
      name         | apiUrl
      ${'Domains'} | ${'/api/domains'}
      ${'Users'}   | ${'/api/users'}
    `('$name', ({ name, apiUrl }) => {
      it(`should return a 200 when correct cookie adminKey in ${name} GET`, (done) => {
        withAdminCookieRequest
          .get(apiUrl)
          .expect(200)
          .then(() => done());
      });

      it(`should return an empty array of items in ${name} GET`, (done) => {
        withAdminCookieRequest
          .get(apiUrl)
          .then((results) => {
            assert.deepStrictEqual(results.body, []);
          })
          .then(() => done());
      });
    });

    describe.each`
      name        | apiUrl            | data                                                            | propsToCheck             | propsToExpect
      ${'Domain'} | ${'/api/domains'} | ${{ name: 'name1' }}                                            | ${['name']}              | ${['_id', 'createdAt', 'name', 'updatedAt']}
      ${'User'}   | ${'/api/users'}   | ${{ username: 'name1', email: 'a1@a1.com', password: '12345' }} | ${['username', 'email']} | ${['_id', 'createdAt', 'domains', 'email', 'updatedAt', 'username']}
    `('Post $name', ({ name, apiUrl, data, propsToCheck, propsToExpect }) => {
      it(`should post a ${name} and return expected props`, (done) => {
        withAdminCookieRequest
          .post(apiUrl)
          .send(data)
          .expect(200)
          .then((results) => {
            assert.strictEqual(
              propsToCheck.every((el) => results.body[el] === data[el]),
              true
            );
            assert.deepStrictEqual(
              Object.keys(results.body).sort(),
              propsToExpect.sort()
            );
          })
          .then(() => done());
      });
    });

    describe.each`
      name        | apiUrl            | data
      ${'Domain'} | ${'/api/domains'} | ${{ name: 'shor' }}
      ${'Domain'} | ${'/api/domains'} | ${{ name: 'has space' }}
      ${'Domain'} | ${'/api/domains'} | ${{ name: 'has-dash' }}
      ${'Domain'} | ${'/api/domains'} | ${{ name: 'has$pecialChars' }}
      ${'User'}   | ${'/api/users'}   | ${{ username: 'shor', email: 'a1@gmail.com', password: '12345' }}
      ${'User'}   | ${'/api/users'}   | ${{ username: 'has space', email: 'a1@gmail.com', password: '12345' }}
      ${'User'}   | ${'/api/users'}   | ${{ username: 'has-dash', email: 'a1@gmail.com', password: '12345' }}
      ${'User'}   | ${'/api/users'}   | ${{ username: 'has$€', email: 'a1@gmail.com', password: '12345' }}
      ${'User'}   | ${'/api/users'}   | ${{ username: 'bademail', email: 'gmail.com', password: '12345' }}
      ${'User'}   | ${'/api/users'}   | ${{ username: 'badpassword', email: 'a1@gmail.com', password: '1234' }}
    `('Bad Post $name', ({ name, apiUrl, data }) => {
      it(`should fail to post ${name} with bad data: ${JSON.stringify(
        data
      )}`, (done) => {
        withAdminCookieRequest
          .post(apiUrl)
          .send(data)
          .expect(400)
          .then(() => done());
      });
    });

    /* eslint-disable indent */
    // TODO: FIX THIS SHITTY INDENTATION
    describe.each`
      name         | apiUrl            | dummyEntries                                 | propsToCheck | propsToExpect
      ${'Domains'} | ${'/api/domains'} | ${[{ name: 'ohmama' }, { name: 'ohmama2' }]} | ${['name']}  | ${['_id', 'createdAt', 'name', 'updatedAt']}
      ${'Users'} | ${'/api/users'} | ${[
  { username: 'name1', email: 'a1@a1.co', password: '12345' },
  { username: 'name2', email: 'a2@a2.co', password: '12345' },
]} | ${['username', 'email']} | ${['_id', 'createdAt', 'domains', 'email', 'updatedAt', 'username']}
    `(
      'With 2 $name',
      ({ name, apiUrl, dummyEntries, propsToCheck, propsToExpect }) => {
        beforeEach(() => {
          return supertestSeries([
            () => withAdminCookieRequest.post(apiUrl).send(dummyEntries[0]),
            () => withAdminCookieRequest.post(apiUrl).send(dummyEntries[1]),
          ]);
        });

        it(`should return 2 ${name} with expected props`, (done) => {
          withAdminCookieRequest
            .get(apiUrl)
            .then((results) => {
              assert.strictEqual(results.body.length, 2);
              assert.deepStrictEqual(
                Object.keys(results.body[0]).sort(),
                propsToExpect.sort()
              );

              assert.strictEqual(
                propsToCheck.every(
                  (el) =>
                    results.body[0][el] === dummyEntries[0][el] &&
                    results.body[1][el] === dummyEntries[1][el]
                ),
                true
              );
            })
            .then(() => done());
        });

        it(
          `should delete an entry from ${name}, return expected props ` +
            `and new ${name} length`,
          (done) => {
            let entryId;
            let originalEntriesLen;

            supertestSeries([
              () =>
                withAdminCookieRequest.get(apiUrl).then((results) => {
                  entryId = results.body[0]._id;
                  originalEntriesLen = results.body.length;
                }),
              () =>
                withAdminCookieRequest
                  .delete(apiUrl + '/' + entryId)
                  .then((results) => {
                    assert.deepStrictEqual(
                      Object.keys(results.body).sort(),
                      propsToExpect.sort()
                    );
                  }),
              () =>
                withAdminCookieRequest.get(apiUrl).then((results) => {
                  assert.strictEqual(
                    results.body.length,
                    originalEntriesLen - 1
                  );
                }),
            ]).then(() => done());
          }
        );
      }
    );
  });
});
