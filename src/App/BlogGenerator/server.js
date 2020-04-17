const http = require('http');
const { createFsFromVolume, Volume } = require('memfs');
const helpers = require('./helpers');
const blogSample = require('./blogSample');

const REDIRECT_MATCH_REGEX = /(\.html|\/+)$/;
const ASSETS_EXT_REGEX = /\.(css|js)$/;
const CONTENT_TYPES = {
    html: 'text/html; charset=utf-8',
    css: 'text/css; charset=utf-8',
    js: 'text/javascript; charset=utf-8',
};
const port = process.env.PORT;

const blogFileStructurePromise = helpers.generateBlogFileStructure(blogSample, {
    env: 'development',
});

blogFileStructurePromise.then((blogFileStructure) => {
    const volume = Volume.fromJSON(blogFileStructure, '/');

    const memfs = createFsFromVolume(volume);

    http.createServer((req, res) => {
        const reqUrl = req.url;

        if (reqUrl !== '/' && REDIRECT_MATCH_REGEX.test(reqUrl)) {
            const newUrl = reqUrl.replace(REDIRECT_MATCH_REGEX, '');

            res.writeHead(302, {
                location: reqUrl.replace(
                    REDIRECT_MATCH_REGEX,
                    newUrl === '' ? '/' : ''
                ),
            });
            res.end();

            return;
        }

        if (ASSETS_EXT_REGEX.test(reqUrl)) {
            const ext = reqUrl.match(ASSETS_EXT_REGEX)[1];

            res.writeHead(200, { 'Content-Type': CONTENT_TYPES[ext] });

            try {
                res.write(memfs.readFileSync(reqUrl));
                res.end();
            } catch (e) {
                res.writeHead(500);
                res.end();
            }

            return;
        }

        const content = ['.html', '/index.html'].reduce((prev, el) => {
            try {
                if (!prev) {
                    return memfs.readFileSync(reqUrl + el);
                }
            } catch (e) {}

            return prev;
        }, null);

        if (content) {
            res.writeHead(200, {
                'Content-Type': CONTENT_TYPES.html,
            });
            res.write(content);
            res.end();
        } else {
            res.writeHead(404);
            res.write('Not found');
            res.end();
        }
    }).listen(port, () => {
        console.log('Listening in port', port);
    });
});
