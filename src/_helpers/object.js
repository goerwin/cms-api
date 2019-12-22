function replaceObjValues(obj, replacements = []) {
  if (typeof obj !== 'object') {
    let newEl = obj;

    replacements.forEach((rep) => {
      if (newEl === rep[0]) newEl = rep[1];
    })

    return newEl;
  }

  if (Array.isArray(obj)) {
    return obj.map((el) => {
      return replaceObjValues(el, replacements);
    })
  } else {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = replaceObjValues(obj[key], replacements);
      return acc;
    }, {})
  }
}

module.exports = {
  replaceObjValues
}
