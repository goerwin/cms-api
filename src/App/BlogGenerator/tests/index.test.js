const assert = require('assert');
const blogParsedExpected = require('./blogParsedExpected.json');
const blogParsedExpected4 = require('./blogParsedExpected4.json');
const inputBlog = require('./inputBlog.json');
const inputBlog2 = require('./inputBlog2.json');
const inputBlog3 = require('./inputBlog3.json');
const inputBlog4 = require('./inputBlog4.json');
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

    const result =
        allMatched && Object.keys(matches).length === expectedArray.length;

    if (!result) {
        console.error(inputArray, expectedArray);
        throw new Error('rip');
    }

    return result;
}

describe('Main', () => {
    it('should return correct parsed blog', () => {
        assert.deepStrictEqual(
            helpers.getParsedBlog({ ...inputBlog }),
            blogParsedExpected
        );
    });

    it('should return correct parsed blog with posts ordered by date', () => {
        assert.deepStrictEqual(
            helpers.getParsedBlog({ ...inputBlog4 }),
            blogParsedExpected4
        );
    });

    it('should return all files expected', (done) => {
        const filesToGenerateExpected = [
            /^index\..*\.css$/,
            /^index\..*\.bundle\.js$/,
            'index.html',
            'post-1-slug/index.html',
            'title-2/index.html',
            'title-3/index.html',
            'tags/technology/index.html',
            'tags/personal/index.html',
            'tags/index.html',
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
            '2/index.html',
            '3/index.html',
            'post-1-slug/index.html',
            'title-2/index.html',
            'title-3/index.html',
            'title-4/index.html',
            'title-5/index.html',
            'title-6/index.html',
            'title-7/index.html',
            'tags/index.html',
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
            '2/index.html',
            '3/index.html',
            'post-1-slug/index.html',
            'title-2/index.html',
            'title-3/index.html',
            'title-4/index.html',
            'title-5/index.html',
            'title-6/index.html',
            'title-7/index.html',
            'tags/technology/index.html',
            'tags/technology/2/index.html',
            'tags/personal/index.html',
            'tags/index.html',
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

    it('should return correct metadata for index page', (done) => {
        helpers
            .generateBlogFileStructure({ ...inputBlog3 })
            .then((blogFileStucture) => {
                assert.strictEqual(
                    blogFileStucture['index.html'].content.indexOf(
                        '<title>Main title | the blog name</title>'
                    ) !== -1,
                    true
                );
                assert.strictEqual(
                    blogFileStucture['index.html'].content.indexOf(
                        '<meta name="description" content="Main description">'
                    ) !== -1,
                    true
                );
            })
            .then(() => done());
    }, 10000);

    it('should return correct metadata for paginated pages', (done) => {
        helpers
            .generateBlogFileStructure({ ...inputBlog3 })
            .then((blogFileStucture) => {
                assert.strictEqual(
                    blogFileStucture['2/index.html'].content.indexOf(
                        '<title>Main title | 2 | the blog name</title>'
                    ) !== -1,
                    true
                );
                assert.strictEqual(
                    blogFileStucture['2/index.html'].content.indexOf(
                        '<meta name="description" content="Main description">'
                    ) !== -1,
                    true
                );

                assert.strictEqual(
                    blogFileStucture['3/index.html'].content.indexOf(
                        '<title>Main title | 3 | the blog name</title>'
                    ) !== -1,
                    true
                );
                assert.strictEqual(
                    blogFileStucture['3/index.html'].content.indexOf(
                        '<meta name="description" content="Main description">'
                    ) !== -1,
                    true
                );
            })
            .then(() => done());
    }, 10000);

    it('should return correct metadata for post pages', (done) => {
        helpers
            .generateBlogFileStructure({ ...inputBlog3 })
            .then((blogFileStucture) => {
                assert.strictEqual(
                    blogFileStucture['post-1-slug/index.html'].content.indexOf(
                        '<title>Title 1 | the blog name</title>'
                    ) !== -1,
                    true
                );
                assert.strictEqual(
                    blogFileStucture['post-1-slug/index.html'].content.indexOf(
                        '<meta name="description" content="Description 1">'
                    ) !== -1,
                    true
                );

                assert.strictEqual(
                    blogFileStucture['title-2/index.html'].content.indexOf(
                        '<title>Title 2 | the blog name</title>'
                    ) !== -1,
                    true
                );
                assert.strictEqual(
                    blogFileStucture['title-2/index.html'].content.indexOf(
                        '<meta name="description" content="Description 2">'
                    ) !== -1,
                    true
                );
            })
            .then(() => done());
    }, 10000);

    it('should return correct metadata for tag pages', (done) => {
        helpers
            .generateBlogFileStructure({ ...inputBlog3 })
            .then((blogFileStucture) => {
                assert.strictEqual(
                    blogFileStucture['tags/technology/index.html'].content.indexOf(
                        '<title>Technology | the blog name</title>'
                    ) !== -1,
                    true
                );
                assert.strictEqual(
                    blogFileStucture['tags/technology/index.html'].content.indexOf(
                        '<meta name="description" content="Main description">'
                    ) !== -1,
                    true
                );
            })
            .then(() => done());
    }, 10000);

    it('should return correct metadata for paginated tag pages', (done) => {
        helpers
            .generateBlogFileStructure({ ...inputBlog3 })
            .then((blogFileStucture) => {
                assert.strictEqual(
                    blogFileStucture['tags/technology/2/index.html'].content.indexOf(
                        '<title>Technology | 2 | the blog name</title>'
                    ) !== -1,
                    true
                );
                assert.strictEqual(
                    blogFileStucture['tags/technology/2/index.html'].content.indexOf(
                        '<meta name="description" content="Main description">'
                    ) !== -1,
                    true
                );
            })
            .then(() => done());
    }, 10000);

    it('should return correct metadata for the tag page', (done) => {
        helpers
            .generateBlogFileStructure({ ...inputBlog3 })
            .then((blogFileStucture) => {
                assert.strictEqual(
                    blogFileStucture['tags/index.html'].content.indexOf(
                        '<title>Tags | the blog name</title>'
                    ) !== -1,
                    true
                );
                assert.strictEqual(
                    blogFileStucture['tags/index.html'].content.indexOf(
                        '<meta name="description" content="Main description">'
                    ) !== -1,
                    true
                );
            })
            .then(() => done());
    }, 10000);

    it.todo('should return post mediaFiles');
    it.todo('test pagination');
});
