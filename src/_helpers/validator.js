const validator = require('validator').default;

const ERRORS = {
  MISSING_PARAM: 'MISSING_PARAM',
  VALIDATION_FAIL: 'VALIDATION_FAIL'
};

function requiredObjProps(obj, properties = []) {
  return Promise.resolve()
    .then(() => {
      properties.forEach((property) => {
        if (obj[property] === undefined) {
          throw new Error(JSON.stringify({ name: ERRORS.MISSING_PARAM, value: property }));
        }
      });

      return obj;
    })
}

function validateObj(obj, validations = []) {
  return Promise.resolve()
    .then(() => {
      validations.forEach((validation) => {
        const [property, validatorName, params] = validation;

        if (!validator[validatorName](obj[property] + '', ...(params || []))) {
          throw new Error(JSON.stringify({
            name: ERRORS.VALIDATION_FAIL,
            value: { name: property, value: obj[property], validator: validatorName, params }
          }))
        }
      });

      return obj;
    });
}

module.exports = {
  requiredObjProps,
  validateObj
}
