const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const ERRORS = {
    PASSWORDS_DONT_MATCH: 'PASSWORDS_DONT_MATCH',
};

function createHashedPassword(plainTextPassword) {
    return bcrypt
        .hash(plainTextPassword, SALT_ROUNDS)
        .then((hashedPassword) => hashedPassword);
}

function comparePasswords(plainTextPassword, hashedPassword) {
    return bcrypt.compare(plainTextPassword, hashedPassword).then((result) => {
        if (!result)
            throw new Error(
                JSON.stringify({ name: ERRORS.PASSWORDS_DONT_MATCH })
            );
        return plainTextPassword;
    });
}

module.exports = {
    createHashedPassword,
    comparePasswords,
};
