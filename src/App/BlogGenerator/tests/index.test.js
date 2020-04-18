const assert = require('assert');
const blogParsedExpected = require('./blogParsedExpected.json');
const inputBlog = require('./blogInput.json');
const inputBlog2 = require('./blogInput2.json');
const inputBlog3 = require('./blogInput3.json');
const helpers = require('../helpers');

function compareStrictEqualStringRegexArrays(expectedArray, inputArray) {
    let matches = {};

    const allMatched = inputArray.every((inputArrayEl) => {
        let result;

        expectedArray.forEach((expectedArrayEl, idx) => {
            if (result) {
                return;
            }

            result =
                expectedArrayEl instanceof RegExp
                    ? !!inputArrayEl.match(expectedArrayEl)
                    : inputArrayEl === expectedArrayEl;

            if (result) {
                matches[idx] = inputArrayEl;
            }
        });

        return result;
    });

    return allMatched && Object.keys(matches).length === expectedArray.length;
}

describe('Main', () => {
    it('should return correct parsed blog', () => {
        assert.deepStrictEqual(
            helpers.getParsedBlog({ ...inputBlog }),
            blogParsedExpected
        );
    });

    it('should return all files expected', (done) => {
        const filesToGenerateExpected = [
            /^index\..*\.css$/,
            /^index\..*\.bundle\.js$/,
            'index.html',
            'post-1-slug.html',
            'title-2.html',
            'title-3.html',
            'tags/technology/index.html',
            'tags/personal/index.html',
        ];

        helpers
            .generateBlogFileStructure({ ...inputBlog })
            .then((blogFileStucture) => {
                assert.strictEqual(
                    compareStrictEqualStringRegexArrays(
                        filesToGenerateExpected,
                        Object.keys(blogFileStucture)
                    ),
                    true
                );
            })
            .then(() => done());
    }, 10000);

    it('should return all files expected with pagination', (done) => {
        const filesToGenerateExpected = [
            /^index\..*\.css$/,
            /^index\..*\.bundle\.js$/,
            'index.html',
            '2.html',
            '3.html',
            'post-1-slug.html',
            'title-2.html',
            'title-3.html',
            'title-4.html',
            'title-5.html',
            'title-6.html',
            'title-7.html',
        ];

        helpers
            .generateBlogFileStructure({ ...inputBlog2 })
            .then((blogFileStucture) => {
                assert.strictEqual(
                    compareStrictEqualStringRegexArrays(
                        filesToGenerateExpected,
                        Object.keys(blogFileStucture)
                    ),
                    true
                );
            })
            .then(() => done());
    }, 10000);

    it('should return all files expected with pagination in tags pages', (done) => {
        const filesToGenerateExpected = [
            /^index\..*\.css$/,
            /^index\..*\.bundle\.js$/,
            'index.html',
            '2.html',
            '3.html',
            'post-1-slug.html',
            'title-2.html',
            'title-3.html',
            'title-4.html',
            'title-5.html',
            'title-6.html',
            'title-7.html',
            'tags/technology/index.html',
            'tags/personal/index.html',
            'tags/technology/2.html',
        ];

        helpers
            .generateBlogFileStructure({ ...inputBlog3 })
            .then((blogFileStucture) => {
                assert.strictEqual(
                    compareStrictEqualStringRegexArrays(
                        filesToGenerateExpected,
                        Object.keys(blogFileStucture)
                    ),
                    true
                );
            })
            .then(() => done());
    }, 10000);
});
