const validator = require('./validator');
const assert = require('assert');

describe('validator', () => {
  describe('requiredObjProps', () => {
    it('should pass required props and return same object', (done) => {
      const obj = { name: 'erwin', password: '1234' };
      validator.requiredObjProps(obj, ['name', 'password'])
        .then((validObj) => assert.strictEqual(obj, validObj))
        .then(done)
    });

    it('should pass required props if they are null', (done) => {
      const obj = { email: null };
      validator.requiredObjProps(obj, ['email'])
        .then((validObj) => assert.strictEqual(obj, validObj))
        .then(done)
    });

    it('should throw an error with proper message if required prop is missing', (done) => {
      const obj = { name: 'erwin', password: '1234' };
      validator.requiredObjProps(obj, ['name', 'password', 'email'])
        .catch((err) => assert.strictEqual(
          err.message,
          JSON.stringify({ name: 'MISSING_PARAM', value: 'email' })
        ))
        .then(done)
    });
  })

  describe('validateObj', () => {
    it('should pass object validations and return same object', (done) => {
      const obj = { email: 'erwin@gmail.com', username: 'erwin' };
      validator.validateObj(obj, [['email', 'isEmail']])
        .then((validObj) => assert.strictEqual(obj, validObj))
        .then(() => validator.validateObj(obj, [
          ['username', 'isLength', [{ min: 5, max: 10 }]]
        ]))
        .then((validObj) => assert.strictEqual(obj, validObj))
        .then(done)
    });

    it('should throw object validations', (done) => {
      const obj = { email: 'notanemail.com', username: 'erwe' };
      validator.validateObj(obj, [['email', 'isEmail']])
        .catch((err) => assert.strictEqual(
          err.message,
          JSON.stringify({
            name: 'VALIDATION_FAIL',
            value: { name: 'email', value: 'notanemail.com', validator: 'isEmail' }
          })
        ))
        .then(() => validator.validateObj(obj, [
          ['username', 'isLength', [{ min: 5, max: 10 }]]
        ]))
        .catch((err) => assert.strictEqual(
          err.message,
          JSON.stringify({
            name: 'VALIDATION_FAIL',
            value: {
              name: 'username',
              value: 'erwe',
              validator: 'isLength',
              params: [{ min: 5, max: 10 }]
            }
          })
        ))
        .then(done)
    });
  })
});
