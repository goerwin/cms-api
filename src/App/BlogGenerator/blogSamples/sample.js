const fsExtra = require('fs-extra');
const path = require('path');

function getPostContent(name) {
    return fsExtra.readFileSync(path.join(__dirname, name), {
        encoding: 'utf8',
    });
}

module.exports = {
    slogan: 'Coding apps for fun!',
    postsPerPage: 3,
    metadata: {
        author: 'Erwin Gaitan',
        authorWebsite: 'https://goerwin.co',
        blogName: 'Goerwin',
        baseUrl: '/',
        logo:
            'https://www.goerwin.co/favicon.2ffaed93a60f96abd18e6d71ef564314.png',
        title: 'Blog By Erwin Gaitan',
        description: 'Personal Blog by Erwin Gaitan',
    },
    posts: [
        {
            tags: ['technology'],
            title: 'Post 1',
            description: 'Post 1',
            date: 'November 20, 2018',
            content: getPostContent('post1.md'),
        },
        {
            tags: ['technology'],
            title: 'Post 2',
            description: 'Post 2',
            date: 'November 20, 2018',
            content: getPostContent('post2.md'),
        },
    ],
};
