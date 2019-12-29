function replaceObjValues(obj, replacements = [], path = '') {
  if (typeof obj !== 'object') {
    let newEl = obj;

    replacements.forEach((rep) => {
      const [replacer, replacee] = rep;

      if (replacer === newEl) {
        if (typeof replacee === 'function') {
          newEl = replacee(newEl, path);
        } else {
          newEl = replacee;
        }
      } else if (replacer instanceof RegExp) {
        if (replacer.test(newEl)) {
          if (typeof replacee === 'function') {
            newEl = replacee(String(newEl).match(replacer), path);
          } else {
            newEl = String(newEl).replace(replacer, replacee);
          }
        }
      }
    });

    return newEl;
  }

  if (Array.isArray(obj)) {
    return obj.map((el, idx) => {
      return replaceObjValues(el, replacements, `${path}[${idx}]`);
    });
  } else {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = replaceObjValues(
        obj[key],
        replacements,
        `${path}${path ? '.' : ''}${key}`
      );

      return acc;
    }, {});
  }
}

module.exports = {
  replaceObjValues,
};
