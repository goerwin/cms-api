const { strictEqual, deepStrictEqual } = require('assert');
const { createApp } = require('../../App');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { supertestSeries } = require('./_helpers');

const domainPropsToCheck = ['name'];
const domainPropsToExpect = ['_id', 'createdAt', 'name', 'updatedAt'];
const userPropsToCheck = ['email', 'username'];
const userPropsToExpect = [
  '_id',
  'createdAt',
  'domains',
  'email',
  'updatedAt',
  'username',
];

const badDataToPostPatchDomains = [
  { name: 'shor' },
  { name: 'has space' },
  { name: 'has-dash' },
  { name: 'has$pecialChars' },
];

const badDataToPatchDomains = [{ name: 'eee' }];

const badDataToPostPatchUsers = [
  { username: 'shor', email: 'a1@a1.com', password: '12345' },
  { username: 'has space', email: 'a2@a2.com', password: '12345' },
  { username: 'has-dash', email: 'a3@a3.com', password: '12345' },
  { username: 'has$€', email: 'a4@a4.com', password: '12345' },
  { username: 'bademail', email: 'gmail.com', password: '12345' },
  {
    username: 'baddomain',
    email: 'a5@a5.com',
    password: '12345',
    domains: '123456',
  },
  { username: 'badpassword', email: 'a6@a6.com', password: '1234' },
];

const badDataToPatchUsers = [{ email: 'a1.com' }, { password: '1234' }];

const goodDataToPostPatchUsers = [
  { username: 'name1', email: 'a1@a1.com', password: '12345' },
  { username: 'name2ha', email: 'a2@a2.com', password: '12345' },
  { username: 'name3go', email: 'a3@a3.com', password: '12345' },
  { username: 'name4erwin', email: 'a4@a4.com', password: '12345' },
];

const goodDataToPatchUsers = [
  { email: 'patch1@patch1.com' },
  { password: '12345' },
];

const goodDataToPostPatchDomains = [
  { name: 'name1' },
  { name: 'name2ha' },
  { name: 'name3go' },
  { name: 'name4erwin' },
];

const goodDataToPatchDomains = [{ name: 'patch1' }, { name: 'patch2' }];

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
    requestType
    ${'get'}
    ${'post'}
    ${'patch'}
    ${'delete'}
  `('$requestType', ({ requestType }) => {
    describe.each`
      name         | apiUrl
      ${'Domains'} | ${'/api/domains'}
      ${'Users'}   | ${'/api/users'}
    `('$name', ({ name, apiUrl }) => {
      it(`should return a 401 if no cookie adminKey in ${name} ${requestType}`, (done) => {
        supertest(app)
          [requestType](apiUrl)
          .expect(401)
          .then(() => done());
      });

      it(`should return a 401 when wrong cookie adminKey in ${name} ${requestType}`, (done) => {
        supertest
          .agent(app)
          [requestType](apiUrl)
          .set('Cookie', ['adminKey=aBADRandomSecretAdminKey;'])
          .expect(401)
          .then(() => done());
      });
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
      name        | apiUrl            | data                             | propsToCheck          | propsToExpect
      ${'Domain'} | ${'/api/domains'} | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
      ${'Domain'} | ${'/api/domains'} | ${goodDataToPostPatchDomains[1]} | ${domainPropsToCheck} | ${domainPropsToExpect}
      ${'Domain'} | ${'/api/domains'} | ${goodDataToPostPatchDomains[2]} | ${domainPropsToCheck} | ${domainPropsToExpect}
      ${'Domain'} | ${'/api/domains'} | ${goodDataToPostPatchDomains[3]} | ${domainPropsToCheck} | ${domainPropsToExpect}
      ${'User'}   | ${'/api/users'}   | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
      ${'User'}   | ${'/api/users'}   | ${goodDataToPostPatchUsers[1]}   | ${userPropsToCheck}   | ${userPropsToExpect}
      ${'User'}   | ${'/api/users'}   | ${goodDataToPostPatchUsers[2]}   | ${userPropsToCheck}   | ${userPropsToExpect}
      ${'User'}   | ${'/api/users'}   | ${goodDataToPostPatchUsers[3]}   | ${userPropsToCheck}   | ${userPropsToExpect}
    `('POST $name', ({ name, apiUrl, data, propsToCheck, propsToExpect }) => {
      it(
        `should POST a ${name} with data ${JSON.stringify(data)} ` +
          'and return expected props',
        (done) => {
          withAdminCookieRequest
            .post(apiUrl)
            .send(data)
            .expect(200)
            .then((results) => {
              strictEqual(
                propsToCheck.every((el) => results.body[el] === data[el]),
                true
              );
              deepStrictEqual(Object.keys(results.body).sort(), propsToExpect);
            })
            .then(() => done());
        }
      );
    });

    describe.each`
      name        | apiUrl            | badData
      ${'Domain'} | ${'/api/domains'} | ${badDataToPostPatchDomains[0]}
      ${'Domain'} | ${'/api/domains'} | ${badDataToPostPatchDomains[1]}
      ${'Domain'} | ${'/api/domains'} | ${badDataToPostPatchDomains[2]}
      ${'Domain'} | ${'/api/domains'} | ${badDataToPostPatchDomains[3]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[0]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[1]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[2]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[3]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[4]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[5]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[6]}
    `('Bad POST $name', ({ name, apiUrl, badData }) => {
      it(`should fail to POST ${name} with bad post data: ${JSON.stringify(
        badData
      )}`, (done) => {
        withAdminCookieRequest
          .post(apiUrl)
          .send(badData)
          .expect(400)
          .then(() => done());
      });
    });

    describe.each`
      name        | apiUrl            | data                             | dataToPost                       | propsToCheck          | propsToExpect
      ${'Domain'} | ${'/api/domains'} | ${goodDataToPostPatchDomains[0]} | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
      ${'Domain'} | ${'/api/domains'} | ${goodDataToPostPatchDomains[1]} | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
      ${'Domain'} | ${'/api/domains'} | ${goodDataToPatchDomains[0]}     | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
      ${'Domain'} | ${'/api/domains'} | ${goodDataToPatchDomains[1]}     | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
      ${'User'}   | ${'/api/users'}   | ${goodDataToPostPatchUsers[0]}   | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
      ${'User'}   | ${'/api/users'}   | ${goodDataToPostPatchUsers[1]}   | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
      ${'User'}   | ${'/api/users'}   | ${goodDataToPatchUsers[0]}       | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
      ${'User'}   | ${'/api/users'}   | ${goodDataToPatchUsers[1]}       | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
    `(
      'PATCH $name',
      ({ name, apiUrl, data, dataToPost, propsToCheck, propsToExpect }) => {
        it(
          `should PATCH a ${name} with data ${JSON.stringify(data)} ` +
            'and return expected props',
          (done) => {
            let entryId;

            supertestSeries([
              () =>
                withAdminCookieRequest
                  .post(apiUrl)
                  .send(dataToPost)
                  .then((results) => {
                    entryId = results.body._id;
                  }),
              () =>
                withAdminCookieRequest
                  .patch(apiUrl + '/' + entryId)
                  .send(data)
                  .expect(200)
                  .then((results) => {
                    strictEqual(
                      propsToCheck.every(
                        (el) =>
                          results.body[el] === { ...dataToPost, ...data }[el]
                      ),
                      true
                    );
                    deepStrictEqual(
                      Object.keys(results.body).sort(),
                      propsToExpect
                    );
                  }),
            ]).then(() => done());
          }
        );
      }
    );

    describe.each`
      name        | apiUrl            | badData                         | goodData
      ${'Domain'} | ${'/api/domains'} | ${badDataToPostPatchDomains[0]} | ${goodDataToPostPatchDomains[0]}
      ${'Domain'} | ${'/api/domains'} | ${badDataToPostPatchDomains[1]} | ${goodDataToPostPatchDomains[0]}
      ${'Domain'} | ${'/api/domains'} | ${badDataToPostPatchDomains[2]} | ${goodDataToPostPatchDomains[0]}
      ${'Domain'} | ${'/api/domains'} | ${badDataToPostPatchDomains[3]} | ${goodDataToPostPatchDomains[0]}
      ${'Domain'} | ${'/api/domains'} | ${badDataToPatchDomains[0]}     | ${goodDataToPostPatchDomains[0]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPatchUsers[0]}       | ${goodDataToPostPatchUsers[0]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPatchUsers[1]}       | ${goodDataToPostPatchUsers[0]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[0]}   | ${goodDataToPostPatchUsers[0]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[1]}   | ${goodDataToPostPatchUsers[0]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[2]}   | ${goodDataToPostPatchUsers[0]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[3]}   | ${goodDataToPostPatchUsers[0]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[4]}   | ${goodDataToPostPatchUsers[0]}
      ${'User'}   | ${'/api/users'}   | ${badDataToPostPatchUsers[5]}   | ${goodDataToPostPatchUsers[0]}
    `('Bad PATCH $name', ({ name, apiUrl, badData, goodData }) => {
      it(`should fail to PATCH ${name} with bad patch data: ${JSON.stringify(
        badData
      )}`, (done) => {
        let entryId;

        supertestSeries([
          () => withAdminCookieRequest.post(apiUrl).send(goodData),
          () =>
            withAdminCookieRequest.get(apiUrl).then((results) => {
              entryId = results.body[0]._id;
            }),
          () =>
            withAdminCookieRequest
              .patch(apiUrl + '/' + entryId)
              .send(badData)
              .expect(400),
        ]).then(() => done());
      });
    });

    describe.each`
      name         | apiUrl            | dummyEntries                              | goodNewData                      | propsToCheck          | propsToExpect
      ${'Domains'} | ${'/api/domains'} | ${goodDataToPostPatchDomains.slice(0, 2)} | ${goodDataToPostPatchDomains[3]} | ${domainPropsToCheck} | ${domainPropsToExpect}
      ${'Users'}   | ${'/api/users'}   | ${goodDataToPostPatchUsers.slice(0, 2)}   | ${goodDataToPostPatchUsers[3]}   | ${userPropsToCheck}   | ${userPropsToExpect}
    `(
      'With 2 $name entries',
      ({
        name,
        apiUrl,
        dummyEntries,
        goodNewData,
        propsToCheck,
        propsToExpect,
      }) => {
        let firstEntryId;
        let originalEntriesLen;

        beforeEach(() => {
          return supertestSeries([
            () => withAdminCookieRequest.post(apiUrl).send(dummyEntries[0]),
            () => withAdminCookieRequest.post(apiUrl).send(dummyEntries[1]),
            () =>
              withAdminCookieRequest.get(apiUrl).then((results) => {
                firstEntryId = results.body[0]._id;
                originalEntriesLen = results.body.length;
              }),
          ]);
        });

        it(`should GET first ${name} entry with expected props`, (done) => {
          withAdminCookieRequest
            .get(apiUrl + '/' + firstEntryId)
            .expect(200)
            .then((results) => {
              deepStrictEqual(Object.keys(results.body).sort(), propsToExpect);

              strictEqual(
                propsToCheck.every(
                  (el) => results.body[el] === dummyEntries[0][el]
                ),
                true
              );
            })
            .then(() => done());
        });

        it(`should GET 2 ${name} entries with expected props`, (done) => {
          withAdminCookieRequest
            .get(apiUrl)
            .then((results) => {
              strictEqual(results.body.length, 2);
              deepStrictEqual(
                Object.keys(results.body[0]).sort(),
                propsToExpect
              );

              strictEqual(
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

        it(`should DELETE the first entry from ${name} and return expected props`, (done) => {
          withAdminCookieRequest
            .delete(apiUrl + '/' + firstEntryId)
            .expect(200)
            .then((results) => {
              deepStrictEqual(Object.keys(results.body).sort(), propsToExpect);

              strictEqual(
                propsToCheck.every(
                  (el) => results.body[el] === dummyEntries[0][el]
                ),
                true
              );
            })
            .then(() => done());
        });

        it(`should DELETE the first entry from ${name} and GET new ${name} length`, (done) => {
          supertestSeries([
            () => withAdminCookieRequest.delete(apiUrl + '/' + firstEntryId),
            () =>
              withAdminCookieRequest.get(apiUrl).then((results) => {
                strictEqual(results.body.length, originalEntriesLen - 1);
              }),
          ]).then(() => done());
        });

        it(`should POST a new entry for ${name} and GET new ${name} length`, (done) => {
          supertestSeries([
            () => withAdminCookieRequest.post(apiUrl).send(goodNewData),
            () =>
              withAdminCookieRequest.get(apiUrl).then((results) => {
                strictEqual(results.body.length, originalEntriesLen + 1);
              }),
          ]).then(() => done());
        });
      }
    );

    it('should POST a user with no domains, return [] domains and also GET [] domains', (done) => {
      supertestSeries([
        () =>
          withAdminCookieRequest
            .post('/api/users')
            .send(goodDataToPostPatchUsers[0])
            .then((results) => {
              deepStrictEqual(results.body.domains, []);
            }),
        () =>
          withAdminCookieRequest.get('/api/users').then((results) => {
            deepStrictEqual(results.body[0].domains, []);
          }),
      ]).then(() => done());
    });

    it(
      'should POST a domain, POST a user with that domain, ' +
        'return it in response and also in GET/id and GET Users',
      (done) => {
        let domainId;
        let userId;

        supertestSeries([
          () =>
            withAdminCookieRequest
              .post('/api/domains')
              .send(goodDataToPostPatchDomains[0])
              .then((results) => (domainId = results.body._id)),
          () =>
            withAdminCookieRequest
              .post('/api/users')
              .send({ ...goodDataToPostPatchUsers[0], domains: [domainId] })
              .then((results) => {
                userId = results.body._id;
                deepStrictEqual(results.body.domains, [domainId]);
              }),
          () =>
            withAdminCookieRequest
              .get('/api/users/' + userId)
              .then((results) => {
                deepStrictEqual(results.body.domains, [domainId]);
              }),
          () =>
            withAdminCookieRequest.get('/api/users').then((results) => {
              deepStrictEqual(results.body[0].domains, [domainId]);
            }),
        ]).then(() => done());
      }
    );
  });
});
