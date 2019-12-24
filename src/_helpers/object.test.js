const assert = require('assert');
const object = require('./object');

describe('object', () => {
  describe('replaceObjectValues', () => {
    it('it should replace ocurrencies', () => {
      const test = {
        a: {
          b: 2,
          c: [{ d: 3 }, ':', { e: ':', f: { g: { h: ':', i: 4 } } }],
        },
      };
      const expected = {
        a: {
          b: 2,
          c: [{ d: 3 }, 'R', { e: 'R', f: { g: { h: 'R', i: 4 } } }],
        },
      };

      assert.deepStrictEqual(
        object.replaceObjValues(test, [[':', 'R']]),
        expected
      );
    });

    it('it should replace multiple ocurrencies', () => {
      const test = {
        a: {
          b: 2,
          c: [{ d: 3 }, ':', { e: 'd', f: { g: { h: ':', i: 4 } } }],
        },
      };
      const expected = {
        a: {
          b: 2,
          c: [{ d: 3 }, 'R', { e: 'F', f: { g: { h: 'R', i: 4 } } }],
        },
      };
      assert.deepStrictEqual(
        object.replaceObjValues(test, [
          [':', 'R'],
          ['d', 'F'],
        ]),
        expected
      );
    });

    it('it should return a new object if replacements were made', () => {
      const test = {
        a: {
          b: 2,
          c: [{ d: 3 }, ':', { e: 'd', f: { g: { h: ':', i: 4 } } }],
        },
      };

      assert.notStrictEqual(
        object.replaceObjValues(test, [
          [':', 'R'],
          ['d', 'F'],
        ]),
        test
      );
    });

    it('it should return a new object if replacements not were made', () => {
      const test = { a: { b: 2, c: [{ d: 3 }] } };

      assert.notStrictEqual(object.replaceObjValues(test, [[':', 'R']]), test);
    });

    it('it should return a new object even if object empty', () => {
      const test = {};

      assert.notStrictEqual(object.replaceObjValues(test, [[':', 'R']]), test);
    });

    it('it should return value replaced when it is a primitive', () => {
      assert.strictEqual(object.replaceObjValues(':', [[':', 'R']]), 'R');
    });

    it('it should replace using a RegExp and a string value', () => {
      assert.strictEqual(
        object.replaceObjValues('{erwin}', [[/\{erwin\}/, 'lul']]),
        'lul'
      );
    });

    it('it should replace using a RegExp and a fn value', () => {
      assert.strictEqual(
        object.replaceObjValues('{erwin}', [
          [/\{(.*)\}/, (match, p1) => `[[${p1}]]`],
        ]),
        '[[erwin]]'
      );
    });
  });
});
