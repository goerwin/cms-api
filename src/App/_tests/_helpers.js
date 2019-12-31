const bluebird = require('bluebird');

function supertestSeries(fns) {
  return bluebird.each(fns, (fn) => fn().then((results) => results));
}

let items = {};

// TODO: REQUIRE AT TOP AND IN ORDER!!!!
// sort-imports NOT WORKING IN ESLINTRC!!!
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp } = require('../../App');

function stf(obj) {
  return JSON.stringify(obj);
}

function instantiateApp() {
  return new MongoMemoryServer().getUri(true).then((mongoUri) =>
    createApp({
      secretDBUrl: mongoUri,
      secretJwtKey: 'aRandomSecretJwtKey',
      secretAdminKey: 'aRandomSecretAdminKey',
    })
  );
}

it.todo('TODO');

module.exports = {
  supertestSeries,
  stf,
  items,
  beforeEachWithAdminCookieApp: () => {
    return instantiateApp().then(
      (createdApp) =>
        (items.withAdminCookieApp = supertest
          .agent(createdApp)
          .set('Cookie', ['adminKey=aRandomSecretAdminKey;']))
    );
  },

  beforeEachApp: () => {
    return instantiateApp().then(
      (createdApp) => (items.app = supertest.agent(createdApp))
    );
  },
};
