require('dotenv').config({ path: './SECRETS.env' });

module.exports = {
  DB_URL: process.env.DB_URL
}
