const cookieParser = require('cookie-parser');

function verifyAdmin(secretAdminKey) {
    return (req, res, next) => {
        return cookieParser()(req, res, () => {
            setTimeout(() => {
                if (req.cookies.adminKey === secretAdminKey) {
                    next();
                } else {
                    res.sendStatus(401);
                }
            }, 1000);
        });
    };
}

module.exports = {
    verifyAdmin,
};
