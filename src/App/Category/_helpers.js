function validateCategory(value) {
    if (
        /^(?!.*\/\/.*)(?!^\/)(?!.*\/$)(?!.*\/[0-9].*)(?!^[0-9].*)[a-z0-9/]+$/.test(
            value
        )
    ) {
        return true;
    }

    throw new Error(`${value} is not a valid category`);
}

module.exports = {
    validateCategory,
};
