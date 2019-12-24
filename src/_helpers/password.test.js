const password = require('./password');
const assert = require('assert');

describe('password', () => {
  describe('createHashedPassword', () => {
    it('should create hashed password different than original', () => {
      return password
        .createHashedPassword('123456')
        .then((hashedPassword) =>
          assert.notStrictEqual(hashedPassword, '123456')
        );
    });

    it('should create hashed password with length 60', () => {
      return password
        .createHashedPassword('123456')
        .then((hashedPassword) =>
          assert.strictEqual(hashedPassword.length, 60)
        );
    });
  });

  describe('comparePasswords', () => {
    it('should validate hashed password with plain text one', () => {
      return password
        .createHashedPassword('123456')
        .then((hashedPassword) =>
          password.comparePasswords('123456', hashedPassword)
        )
        .then((result) => assert.strictEqual(result, '123456'));
    });

    it('should throw if password is incorrect', (done) => {
      return password
        .createHashedPassword('123456')
        .then((hashedPassword) =>
          password.comparePasswords('1234567', hashedPassword)
        )
        .catch((err) =>
          assert.strictEqual(
            err.message,
            JSON.stringify({ name: 'PASSWORDS_DONT_MATCH' })
          )
        )
        .then(done);
    });
  });
});
