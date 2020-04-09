const assert = require('assert');
const helpers = require('./_helpers');

describe('Category helpers', () => {
    it('should pass validation of all the entries', () => {
        [
            'erwin/go',
            'erwin',
            'tech/os',
            'o/s',
            'tech101/entries',
            'tech/entries101',
            'erwin/gaitan/ospino/tech/company',
        ].forEach((el) =>
            assert.strictEqual(helpers.validateCategory(el), true)
        );
    });

    it('should fail validation of all the entries', () => {
        [
            '',
            '0',
            '0erwin',
            '/erwin',
            '/erwin/gaitan',
            'erwin/',
            '0erwin/gaitan',
            'erwin/0gaitan',
            'erwin//gaitan',
            'erwin/gaitan//ospino',
            'erwin/gaitan///ospino',
        ].forEach((el) => assert.throws(() => helpers.validateCategory(el)));
    });
});
