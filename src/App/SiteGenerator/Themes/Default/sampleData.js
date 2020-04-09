module.exports = {
    general: {
        blogAuthor: 'Erwin Gaitan',
        slogan: 'Coding apps for fun!',
        website: 'https://goerwin.co',
    },
    metadata: {
        logo: 'https://werwerwer.png',
        title: 'Blog By Erwin Gaitan',
        description: 'Personal Blog by Erwin Gaitan'
    },
    indexPage: {
        posts: [
            {
                title: 'This is the title of the post',
                url: '/postUrl',
                description:
                    'An in-depth description of the React programming model.',
                date: 'July 30, 2019',
                readTime: '10 min. read',
            },
            {
                title: 'This is the title of the post',
                url: '/postUrl',
                description:
                    'An in-depth description of the React programming model.',
                date: 'July 30, 2019',
                readTime: '10 min. read',
            },
        ],
    },
    postPage: {
        metadata: {
            title: 'This is the title of the post',
            description: 'An in-depth description of the React programming model.'
        },
        title: 'This is the title of the post',
        url: '/postUrl',
        previewText: 'An in-depth description of the React programming model.',
        date: 'July 30, 2019',
        readTime: '10 min. read',
        content:
            'This is the content of the post, This is the content of the postThis is the content of the postThis is the content of the postThis is the content of the postThis is the content of the post',
        prevPost: {
            url: '/postUrl',
            title: 'This is the previous Post Title',
        },
        nextPost: {
            url: '/postUrl',
            title: 'This is the next Post Title',
        },
    },
};
