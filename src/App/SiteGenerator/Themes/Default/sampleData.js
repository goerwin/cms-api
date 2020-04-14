module.exports = {
    blogAuthor: 'Erwin Gaitan',
    slogan: 'Coding apps for fun!',
    website: 'https://goerwin.co',
    metadata: {
        logo: 'https://werwerwer.png',
        title: 'Blog By Erwin Gaitan',
        description: 'Personal Blog by Erwin Gaitan',
    },
    posts: [
        {
            metadata: {
                title: 'This is the title of the post',
                description:
                    'An in-depth description of the React programming model.',
            },
            tags: ['technology'],
            title: 'This is the title of the post',
            url: '/this-is-the-post-url',
            previewText:
                'An in-depth description of the React programming model.',
            date: 'July 30, 2019',
            readTime: '10 min. read',
            content:
                'This is the content of the post, This is the content of the postThis is the content of the postThis is the content of the postThis is the content of the postThis is the content of the post',
            prevPost: {
                url: '/previous-post',
                title: 'This is the previous Post Title',
            },
            nextPost: {
                url: '/next-post',
                title: 'This is the next Post Title',
            },
        },
    ],
};
