const jwt = require('jsonwebtoken');

const DEFAULT_ALGHORITM = 'HS256';
const DEFAULT_EXPIRES_IN = '7d';
const ERRORS = {
    NO_SECRET_KEY: 'NO_SECRET_KEY',
};

function generateToken(payload, secretKey, options) {
    return new Promise((resolve, reject) => {
        if (!secretKey)
            throw new Error(JSON.stringify({ name: ERRORS.NO_SECRET_KEY }));

        jwt.sign(
            payload,
            secretKey,
            {
                algorithm: DEFAULT_ALGHORITM,
                expiresIn: DEFAULT_EXPIRES_IN,
                ...options,
            },
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        );
    });
}

function verifyToken(token, secretKey, options) {
    return new Promise((resolve, reject) => {
        if (!secretKey)
            throw new Error(JSON.stringify({ name: ERRORS.NO_SECRET_KEY }));

        jwt.verify(
            token,
            secretKey,
            {
                algorithms: [DEFAULT_ALGHORITM],
                ...options,
            },
            (err, decodedPayload) => {
                if (err) reject(err);
                resolve(decodedPayload);
            }
        );
    });
}

module.exports = {
    generateToken,
    verifyToken,
};
