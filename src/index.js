require('dotenv').config({ path: './.env' });

const { createApp } = require('./App');

const {
    PORT = 3000,
    SECRET_DB_URL: secretDBUrl,
    SECRET_JWT_KEY: secretJwtKey,
    SECRET_ADMIN_KEY: secretAdminKey,
} = process.env;

const app = createApp({ secretDBUrl, secretJwtKey, secretAdminKey });

app.listen(PORT, () => {
    console.log(`Running server in port: ${PORT}`);
});
