const jwt = require('jsonwebtoken');

const DEFAULT_ALGHORITM = 'HS256';
const DEFAULT_EXPIRES_IN = '7d';
const ERRORS = {
  NO_SECRET_KEY: 'NO_SECRET_KEY'
};

function generateToken(payload, secretKey, options) {
  return Promise.resolve()
    .then(() => {
      if (!secretKey) throw new Error(ERRORS.NO_SECRET_KEY);

      jwt.sign(payload, secretKey, {
        algorithm: DEFAULT_ALGHORITM,
        expiresIn: DEFAULT_EXPIRES_IN,
        ...options
      }, (err, token) => {
        if (err) throw err;
        return token;
      });
    });
}

function verifyToken(token, secretKey, options) {
  return Promise.resolve()
    .then(() => {
      if (!secretKey) throw new Error(ERRORS.NO_SECRET_KEY);

      jwt.verify(token, secretKey, {
        algorithms: [DEFAULT_ALGHORITM],
        ...options
      }, (err, decodedPayload) => {
        if (err) throw err;
        return decodedPayload;
      });
    });
}

module.exports = {
  ERRORS,
  generateToken,
  verifyToken
};
