const jwt = require('./jwt');
const assert = require('assert');

describe('jwt', () => {
  describe('generateToken', () => {
    it('should generate a JWT token of type string', (done) => {
      jwt
        .generateToken({ name: 'erwin', email: 'erwin@erwin.com' }, 'secretKey')
        .then((token) => assert.strictEqual(typeof token, 'string'))
        .then(done);
    });

    it('should throw if no secretKey is provided', (done) => {
      jwt
        .generateToken({ name: 'erwin' })
        .catch((err) =>
          assert.strictEqual(
            err.message,
            JSON.stringify({
              name: 'NO_SECRET_KEY',
            })
          )
        )
        .then(done);
    });
  });

  describe('verifyToken', () => {
    it('should generate and verify a JWT token', (done) => {
      jwt
        .generateToken({ name: 'erwin', email: 'erwin@erwin.com' }, 'secretKey')
        .then((token) => jwt.verifyToken(token, 'secretKey'))
        .then(({ name, email }) =>
          assert.deepStrictEqual(
            { name, email },
            { name: 'erwin', email: 'erwin@erwin.com' }
          )
        )
        .then(done);
    });

    it('should throw if no secretKey is provided', (done) => {
      jwt
        .verifyToken('randomToken')
        .catch((err) =>
          assert.strictEqual(
            err.message,
            JSON.stringify({
              name: 'NO_SECRET_KEY',
            })
          )
        )
        .then(done);
    });

    it('should throw a JWT token if different secretKey is used', (done) => {
      jwt
        .generateToken({ name: 'erwin', email: 'erwin@erwin.com' }, 'secretKey')
        .then((token) => jwt.verifyToken(token, 'differentSecretKey'))
        .catch((err) =>
          assert.strictEqual(err.message.includes('invalid signature'), true)
        )
        .then(done);
    });
  });
});
