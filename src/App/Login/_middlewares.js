const jwt = require('../_helpers/jwt');

function verifyUserLogin(userModel, domainModel, secretJWTKey) {
    return (req, res, next) => {
        jwt
            .verifyToken(req.headers.authorization, secretJWTKey)
            .then((decodedPayload) =>
                userModel.findById(decodedPayload.userId).lean()
            )
            .then((user) => Promise.all([user, domainModel.find({})]))
            .then(([user, domains]) =>
                Promise.all([
                    user,
                    domains.every((domain) =>
                        user.domains.some((userDomain) => userDomain.equals(domain._id))
                    ),
                ])
            )
            .then(([user, hasAccessToAllDomains]) => {
                res.locals.user = {
                    ...user,
                    hasAccessToAllDomains,
                };

                next();
            })
            .catch((err) => res.status(401).json(err.message));
    };
}

module.exports = {
    verifyUserLogin,
};
