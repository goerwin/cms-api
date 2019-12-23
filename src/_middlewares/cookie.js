function validateCookieWith(value, cookieName, errorMsg) {
    return (req, res, next) => {
        if (req.cookies[cookieName] === value) {
            next();
            return;
        }

        res.status(500).send(errorMsg);
    };
}

function setCookieUsingQueryParam(cookieName, queryParamName, options) {
    return (req, res, next) => {
        if (req && req.query && req.query[queryParamName]) {
            res.cookie(cookieName, req.query[queryParamName], {
                maxAge: 900000,
                httpOnly: true,
                ...options,
            });

            res.redirect('/');
            return;
        }

        next();
    };
}

module.exports = {
    validateCookieWith,
    setCookieUsingQueryParam,
};
