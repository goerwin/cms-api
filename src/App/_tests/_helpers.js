const bluebird = require('bluebird');

function supertestSeries(fns) {
  return bluebird.each(fns, (fn) => fn().then((results) => results));
}

module.exports = {
  supertestSeries,
};
